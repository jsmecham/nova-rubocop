//
// RuboCop Extension for Nova
// Linter.js
//
// Copyright © 2019-2020 Justin Mecham. All rights reserved.
//

const RuboCopProcess = require("./RuboCopProcess");

class Linter {

    constructor() {
        this.issues = new IssueCollection();
    }

    async lintDocument(document) {
        if (document.syntax !== "ruby") return;

        const contentRange = new Range(0, document.length);
        const content = document.getTextInRange(contentRange);

        return this.lintString(content, document.uri);
    }

    async lintString(string, uri) {
        const process = new RuboCopProcess(uri, string);
        process.onComplete(offenses => {
            this.issues.set(uri, offenses.map(offense => offense.issue));
        });

        process.execute();
    }

    removeIssues(uri) {
        this.issues.remove(uri);
    }

}

module.exports = Linter;
