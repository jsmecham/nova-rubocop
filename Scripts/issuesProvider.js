// 
// RuboCop for Nova
// issuesProvider.js
//
// Copyright © 2019 Justin Mecham. All rights reserved.
// 

const RuboCopOffense = require("offense");

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

        editor.onDidStopChanging(this.updateFile.bind(this));
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
        if (!this.offenses[relativePath]) return;

        return this.offenses[relativePath].map(offense => offense.issue);
    }

    updateFile(editor) {
      const relativePath =  nova.workspace.relativizePath(editor.document.path);
      this.processFile(relativePath);
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

        const path = parsedResult["files"][0]["path"];
        const rawOffenses = parsedResult["files"][0]["offenses"];
        const offenses = rawOffenses.map(rawOffense => new RuboCopOffense(rawOffense))

        this.offenses[path] = offenses;
    }
}

module.exports = RuboCopIssuesProvider;
