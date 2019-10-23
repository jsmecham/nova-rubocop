// 
// RuboCop for Nova
// issuesProvider.js
//
// Copyright © 2019 Justin Mecham. All rights reserved.
// 

const RuboCopProcess = require("rubocop");

class RuboCopIssuesProvider {

    constructor() {
        this.editors = [];
        this.offenses = {};
    }

    addTextEditor(editor) {
        const document = editor.document;

        if (document.syntax != "ruby") {
            console.info(`[addTextEditor] Skipping ${document.path} (Syntax: ${document.syntax})`);
            return;
        }

        console.info(`[addTextEditor] Adding ${document.path} (Syntax: ${document.syntax})`);

        editor.onDidSave(this.processDocument.bind(this));
        editor.onDidStopChanging(this.processDocument.bind(this));
        editor.onDidDestroy(this.removeTextEditor.bind(this));

        this.editors.push(editor);

        this.processDocument(editor);
    }
    
    removeTextEditor(editor) {
        const index = this.editors.indexOf(editor);
        if (index) {
            const document = editor.document;
            console.info(`[removeTextEditor] Removing editor for ${document.path}`);
            this.editors.splice(this.editors.index, 1);
            delete this.offenses[editor.document.path];
        } else {
            console.warn("[removeTextEditor] Attempted to remove an unknown text editor...")
        }
    }

    provideIssues(editor) {
        const relativePath = nova.workspace.relativizePath(editor.document.path);
        if (!this.offenses[relativePath]) return;

        return this.offenses[relativePath].map(offense => offense.issue);
    }
    
    processDocument(editor) {
        const relativePath = nova.workspace.relativizePath(editor.document.path);
        const contentRange = new Range(0, editor.document.length);
        const content = editor.document.getTextInRange(contentRange);
        const rubocop = new RuboCopProcess(relativePath, content);
        
        rubocop.onComplete =((offenses) => {
            this.offenses[relativePath] = rubocop.offenses;
        });

        rubocop.execute();
    }

}

module.exports = RuboCopIssuesProvider;
