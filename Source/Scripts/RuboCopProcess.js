//
// RuboCop Extension for Nova
// RuboCopProcess.js
//
// Copyright © 2019-2020 Justin Mecham. All rights reserved.
//

const Offense = require("./Offense");

class RuboCopProcess {

    constructor(path, content) {
        this.path = path;
        this.content = content;
    }

    get process() {
        if (this._process) return this._process;

        const process = new Process("/usr/bin/env", {
            args: ["rubocop", "--format=json", "--stdin", this.path],
            cwd: nova.workspace.path,
            stdio: "pipe"
        });

        let output = "";
        process.onStdout(line => output += line);
        process.onStderr(line => output += line);
        process.onDidExit(status => {
            status === 0 ? this.handleError(output) : this.handleOutput(output);
        });

        return (this._process = process);
    }

    execute() {
        this.process.start();

        const channel = this.process.stdin;
        const writer = channel.getWriter();

        writer.ready.then(() => {
            writer.write(this.content);
            writer.close();
        });
    }

    handleError(error) {
        console.error(error);
    }

    handleOutput(output) {
        const parsedOutput = JSON.parse(output);
        const offenses = parsedOutput["files"][0]["offenses"];

        console.info(JSON.stringify(offenses, null, "  "));

        this.offenses = offenses.map(offense => new Offense(offense));

        if (this._onCompleteCallback) {
            this._onCompleteCallback(this.offenses);
        }
    }

    onComplete(callback) {
        this._onCompleteCallback = callback;
    }

}

module.exports = RuboCopProcess;
