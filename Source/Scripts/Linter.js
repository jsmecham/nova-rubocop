//
// RuboCop Extension for Nova
// Linter.js
//
// Copyright © 2019-2020 Justin Mecham. All rights reserved.
//

const LinterProcess = require("./LinterProcess");

class Linter {

    constructor() {
        this.disposables = new CompositeDisposable();
        this.issues = new IssueCollection();
        this.editors = [];

        this.disposables.add(this.issues);

        this.disposables.add(nova.workspace.onDidAddTextEditor(this.startWatchingTextEditor.bind(this)));
    }

    startWatchingTextEditor(editor) {
        const document = editor.document;

        if (document.syntax != "ruby") {
            console.info(`[startWatchingTextEditor] Skipping ${document.path} (Syntax: ${document.syntax})`);
            return;
        }

        console.info(`[startWatchingTextEditor] Adding ${document.path} (Syntax: ${document.syntax})`);

        editor.onDidSave(this.processDocument.bind(this));
        editor.onDidStopChanging(this.processDocument.bind(this));
        editor.onDidDestroy(this.stopWatchingTextEditor.bind(this));

        this.editors.push(editor);

        this.processDocument(editor);
    }

    stopWatchingTextEditor(editor) {
        const index = this.editors.indexOf(editor);

        if (index) {
            const path = editor.document.path;
            console.info(`[stopWatchingTextEditor] Removing editor for ${path}`);
            this.editors.splice(this.editors.index, 1);
            this.issues.remove(path);
        } else {
            console.warn("[stopWatchingTextEditor] Attempted to remove an unknown text editor...");
        }
    }

    processDocument(editor) {
        const path = editor.document.path;
        const relativePath = nova.workspace.relativizePath(path);
        const contentRange = new Range(0, editor.document.length);
        const content = editor.document.getTextInRange(contentRange);
        const process = new LinterProcess(relativePath, content);

        process.onComplete((offenses) => {
            this.issues.set(path, offenses.map(offense => offense.issue));
        });

        process.execute();
    }

    dispose() {
        this.disposables.dispose();
    }

}

module.exports = Linter;
