//
// RuboCop Extension for Nova
// RuboCopProcess.js
//
// Copyright © 2019-2020 Justin Mecham. All rights reserved.
//

const Offense = require("./Offense");

class RuboCopProcess {

    constructor() {
        this.isNotified = false;
    }

    get isBundled() {
        if (typeof this._isBundled !== "undefined") {
            return Promise.resolve(this._isBundled);
        }

        if (!(nova.workspace.contains("Gemfile") || nova.workspace.contains("gems.rb"))) {
            this._isBundled = false;
            return Promise.resolve(false);
        }

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
                    resolve(this._isBundled = true);
                } else {
                    resolve(this._isBundled = false);
                }
            });

            process.start();
        });
    }

    get isGlobal() {
        if (typeof this._isGlobal !== "undefined") {
            return Promise.resolve(this._isGlobal);
        }

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
                    resolve(this._isGlobal = true);
                } else {
                    resolve(this._isGlobal = false);
                }
            });

            process.start();
        });
    }

    async process(commandArguments) {
        if (await this.isBundled) {
            commandArguments.unshift("bundle", "exec");
        } else if (!(await this.isGlobal)) {
            this.notifyUserOfMissingCommand();
            return false;
        }

        const process = new Process("/usr/bin/env", {
            args: commandArguments,
            cwd: nova.workspace.path,
            shell: true,
            stdio: "pipe"
        });

        return process;
    }

    async execute(content, uri) {
        const defaultArguments = [
            "rubocop",
            "--format=json",
            "--stdin",
            uri
        ];

        const process = await this.process(defaultArguments);
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
            writer.write(content);
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
        if (this.isNotified) return;

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
            this.isNotified = true;
        });
    }

    onComplete(callback) {
        this._onCompleteCallback = callback;
    }

}

module.exports = RuboCopProcess;
