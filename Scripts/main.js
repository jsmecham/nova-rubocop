// 
// RuboCop for Nova
// main.js
//
// Created by Justin Mecham on 10/14/19.
// Copyright © 2019 Justin Mecham. All rights reserved.
// 

class RuboCopIssuesProvider {

    constructor() {
        this.editors = [];
        this.offenses = {};
    }

    addTextEditor(editor) {
        const document = editor.document;

        if (document.syntax != "ruby") {
            console.log(`[addTextEditor] Skipping ${document.path} (Syntax: ${document.syntax})`);
            return;
        }

        console.log(`[addTextEditor] Adding ${document.path} (Syntax: ${document.syntax})`);

        const relativePath = nova.workspace.relativizePath(document.path);
        this.processFile(relativePath);

        editor.onDidDestroy(this.removeTextEditor.bind(this));
        this.editors.push(editor);
    }
    
    removeTextEditor(editor) {
        const index = this.editors.indexOf(editor);
        if (index) {
            const document = editor.document;
            console.log(`[removeTextEditor] Removing editor for ${document.path}`);
            this.editors.splice(this.editors.index, 1);
            delete this.offenses[editor.document.path];
        } else {
            console.log.warn("[removeTextEditor] Attempted to remove an unknown text editor...")
        }
    }

    provideIssues(editor) {
                const relativePath = nova.workspace.relativizePath(editor.document.path);

        // console.log("FOO", editor.document.path, JSON.stringify(this.offenses));
        if (!this.offenses[relativePath]) return;
        return this.offenses[relativePath].map(offense => offense.issue);
    }

    processFile(path) {
        const options = {
            args: ["rubocop", "-fj", path],
            cwd: nova.workspace.path
        };

        const process = new Process("/usr/bin/env", options);

        process.onStdout(this.processResult.bind(this));

        process.onStderr(function(line) {
            console.log("Error! ", line);
        });

        process.start();
    }
    
    processResult(result) {
        const parsedResult = JSON.parse(result);
        console.log("processResult ", result);

        const path = parsedResult["files"][0]["path"]; // TODO: WTF?! The results I'm getting back from RuboCop are stripping off "/U" from the beginning of the path...
        const rawOffenses = parsedResult["files"][0]["offenses"];
        const offenses = rawOffenses.map(rawOffense => new RuboCopOffense(rawOffense))

        this.offenses[path] = offenses;
    }
}

class RuboCopOffense {
    
    constructor(rawOffense) {
        this.severity = rawOffense["severity"];
        this.cop = rawOffense["cop_name"];
        this.message = rawOffense["message"];
        this.startColumn = rawOffense["location"]["start_column"];
        this.startLine = rawOffense["location"]["start_line"];
        this.stopColumn = rawOffense["location"]["last_column"];
        this.stopLine = rawOffense["location"]["last_line"];
    }
    
    get issue() {
        const issue = new Issue();

        issue.source = "RuboCop";
        issue.code = this.cop;

        const cleanedMessage = this.message.replace(`${this.cop}: `, "");
        issue.message = cleanedMessage;

        if (this.severity == "warning") {
            issue.severity = IssueSeverity.Warning;
        } else if (this.severity == "error" || this.severity == "fatal") {
            issue.severity = IssueSeverity.Error;
        } else if (this.severity == "refactor" || this.severity == "convention") {
            issue.severity = IssueSeverity.Hint;
        }

        issue.line = this.startLine;
        issue.endLine =  this.stopLine;
        issue.column = this.startColumn;
        issue.endColumn = this.stopColumn;

        return issue;
    }

}


// ----------------------------------------------------------------------------

let disposables;

exports.activate = function() {
    console.log("Activating");

    disposables = new CompositeDisposable();

    const issuesProvider = new RuboCopIssuesProvider();
    nova.workspace.onDidAddTextEditor(issuesProvider.addTextEditor.bind(issuesProvider));

    disposables.add(nova.assistants.registerIssueAssistant("ruby", issuesProvider));
}

exports.deactivate = function() {
    console.log("Deactivating");
    
    disposables.dispose();
}
