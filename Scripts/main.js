// 
// RuboCop for Nova
// main.js
//
// Created by Justin Mecham on 10/14/19.
// Copyright © 2019 Justin Mecham. All rights reserved.
// 

let watcher;

exports.activate = function() {
    // Do work when the extension is activated
    // TODO: Start the file watcher
    
    watcher = nova.fs.watch("*.rb")
}

exports.deactivate = function() {
    // Clean up state before the extension is deactivated
}

// let currentIssues = [];

class RuboCopRunner {
    constructor() {
    }

    processFile(path) {
        let options = {
            args: ["rubocop", "-fj", path]
        };

        let process = new Process("/usr/bin/env", options);

        process.onStdout(this.processResult.bind(this));

        process.onStderr(function(line) {
            console.log("Error! ", line);
        });

        process.start();
    }
    
    processResult(result) {
        const parsedResult = JSON.parse(result);
        console.log("processResult ", result);
        return parsedResult;
    }
}

class IssuesProvider {
    constructor() {
        this.runner = new RuboCopRunner();
    }
    
    provideIssues(editor) {
        let issues = [];

        console.log("provideIssues", editor.document.path);
        
        let results = this.runner.processFile(editor.document.path);

console.log("results:", results);
        if (results && results["files"]) {
            
            results["files"].forEach((file) => {
                console.log("file:", file);
                file["offenses"].forEach((offense) => {
                    console.log("Offense:", offense, offense["message"]);
    
                    let issue = new Issue();
            
                    let message = offense["message"];
                    message = message.replace(`${offense["cop_name"]}: `, "")
                    
                    issue.message = message;
                    
                    let severity = offense["severity"];
                    if (severity == "warning") {
                        issue.severity = IssueSeverity.Warning;
                    } else if (severity == "error" || severity == "fatal") {
                        issue.severity = IssueSeverity.Error;
                    } else if (severity == "refactor" || severity == "convention") {
                        issue.severity = IssueSeverity.Hint;
                    }
    
                    issue.line = offense["location"]["start_line"];
                    issue.endLine = offense["location"]["last_line"]
                    issue.column = offense["location"]["start_column"];
                    issue.endColumn = offense["location"]["last_column"];
                    issue.source = "RuboCop";
                    issue.code = offense["cop_name"];
    
                    issues.push(issue);
                })
            });
        }

        return issues;
    }
    
}


nova.assistants.registerIssueAssistant("ruby", new IssuesProvider());

