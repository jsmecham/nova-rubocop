//
// RuboCop Extension for Nova
// RuboCopProcess.js
//
// Copyright © 2019-2020 Justin Mecham. All rights reserved.
//

const Offense = require("./Offense");
var isUserNotifiedOfMissingCommand;

class RuboCopProcess {

    constructor(path, content) {
        this.path = path;
        this.content = content;
        this.defaultArguments = [
            "--format=json",
            "--no-display-cop-names"
        ];
    }

    get process() {
        if (this._process) return this._process;

        const process = new Process("/usr/bin/env", {
            args: ["rubocop", this.defaultArguments, "--stdin", this.path].flat(),
            cwd: nova.workspace.path,
            stdio: "pipe"
        });

        let output = "";
        process.onStdout(line => output += line);
        process.onStderr(line => output += line);
        process.onDidExit(status => {
            // See: https://github.com/rubocop-hq/rubocop/blob/master/manual/basic_usage.md#exit-codes
            status >= 2 ? this.handleError(output) : this.handleOutput(output);
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
        if (error.match(/(no such file or directory|command not found)/i)) {
            this.handleMissingCommand();
        } else {
            console.error(error);
        }
    }

    handleOutput(output) {
        const parsedOutput = JSON.parse(output);
        const offenses = parsedOutput["files"][0]["offenses"];

        // TODO: Enable a "Debug" Preference
        // console.info(JSON.stringify(offenses, null, "  "));

        this.offenses = offenses.map(offense => new Offense(offense));

        if (this._onCompleteCallback) {
            this._onCompleteCallback(this.offenses);
        }
    }

    handleMissingCommand() {
        if (isUserNotifiedOfMissingCommand) { return; }

        const request = new NotificationRequest("rubocop-not-found");
        request.title = nova.localize("RuboCop Not Found");
        request.body = nova.localize("The \"rubocop\" command could not be found in your environment.");
        request.actions = [nova.localize("OK"), nova.localize("Help")];

        const notificationPromise = nova.notifications.add(request);
        notificationPromise.then((response) => {
            if (response.actionIdx === 1) { // Help
                nova.openConfig();
            }
        }).catch((error) => {
            console.error(error);
        }).finally(() => {
            isUserNotifiedOfMissingCommand = true;
        });
    }

    onComplete(callback) {
        this._onCompleteCallback = callback;
    }

}

module.exports = RuboCopProcess;
