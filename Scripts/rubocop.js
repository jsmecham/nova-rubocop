// 
// RuboCop for Nova
// rubocop.js
//
// Copyright © 2019 Justin Mecham. All rights reserved.
// 

const RuboCopOffense = require("offense");

class RuboCopProcess {

    constructor(path, content = null) {
        this.path = path;
        this.content = content;
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
    
    get process() {
        const process = new Process("/usr/bin/env", {
            args: ["rubocop", "--format=json", "--stdin", this.path],
            cwd: nova.workspace.path,
            stdio: "pipe",
        });

        process.onStdout(this.handleOutput.bind(this));
        process.onStderr(this.handleError.bind(this));

        return process;
    }

    handleError(error) {
        console.error(error);
    }
  
    handleOutput(output) {
        const parsedOutput = JSON.parse(result);
        const offenses = parsedOutput["files"][0]["offenses"];

        console.info(JSON.stringify(offenses, null, "  "));

        this.offenses = offenses.map(offense => new RuboCopOffense(offense))
    }

}

module.exports = RuboCopProcess;
