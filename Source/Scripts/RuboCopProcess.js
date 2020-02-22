//
// RuboCop Extension for Nova
// RuboCopProcess.js
//
// Copyright © 2019-2020 Justin Mecham. All rights reserved.
//

const Offense = require("./Offense");
var isUserNotifiedOfMissingCommand = false;

class RuboCopProcess {

    constructor(path, content) {
        this.path = path;
        this.content = content;
        this.defaultArguments = [
            "rubocop",
            "--format=json",
            "--no-display-cop-names",
            "--stdin",
            this.path
        ];
    }

    get isBundled() {
        if (!nova.workspace.contains("Gemfile")) return Promise.resolve(false);

        return new Promise(resolve => {
            const process = new Process("/usr/bin/env", {
                args: ["bundle", "exec", "rubocop", "--version"],
                cwd: nova.workspace.path,
                shell: true
            });

            let output = "";
            process.onStdout(line => output += line.trim());
            process.onDidExit(status => {
                if (status === 0) {
                    console.log(`Found RuboCop ${output} (Bundled)`);
                    resolve(true);
                } else {
                    resolve(false);
                }
            });

            process.start();
        });
    }

    get isGlobal() {
        return new Promise(resolve => {
            const process = new Process("/usr/bin/env", {
                args: ["rubocop", "--version"],
                cwd: nova.workspace.path,
                shell: true
            });

            let output = "";
            process.onStdout(line => output += line.trim());
            process.onDidExit(status => {
                if (status === 0) {
                    console.log(`Found RuboCop ${output} (Global)`);
                    resolve(true);
                } else {
                    resolve(false);
                }
            });

            process.start();
        });
    }

    async process() {
        if (this._process) return this._process;

        if (await this.isBundled) {
            this.defaultArguments.unshift("bundle", "exec");
        } else if (!(await this.isGlobal)) {
            this.notifyUserOfMissingCommand();
            return false;
        }

        const process = new Process("/usr/bin/env", {
            args: this.defaultArguments,
            cwd: nova.workspace.path,
            stdio: "pipe"
        });

        return (this._process = process);
    }

    async execute() {
        const process = await this.process();
        if (!process) return;

        let output = "";
        process.onStdout(line => output += line);
        process.onStderr(line => output += line);
        process.onDidExit(status => {
            // See: https://github.com/rubocop-hq/rubocop/blob/master/manual/basic_usage.md#exit-codes
            status >= 2 ? this.handleError(output) : this.handleOutput(output);
        });

        process.start();

        const channel = process.stdin;
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

        // TODO: Enable a "Debug" Preference
        // console.info(JSON.stringify(offenses, null, "  "));

        this.offenses = offenses.map(offense => new Offense(offense));

        if (this._onCompleteCallback) {
            this._onCompleteCallback(this.offenses);
        }
    }

    notifyUserOfMissingCommand() {
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
