//
// RuboCop Extension for Nova
// Linter.js
//
// Copyright © 2019-2020 Justin Mecham. All rights reserved.
//

const RuboCopProcess = require("./RuboCopProcess");

class Formatter {
    constructor() {
        this.issues = new IssueCollection();
        this.process = new RuboCopProcess();
    }

    async formatDocument(document) {
        if (document.syntax !== "ruby") return;

        const contentRange = new Range(0, document.length);
        const content = document.getTextInRange(contentRange);

        return this.formatString(content, document.path);
    }

    async formatString(string, uri) {
        // this.process.onComplete(offenses => {
        //   this.issues.set(uri, offenses.map(offense => offense.issue));
        // });
        //
        this.process.execute(string, uri, true);
    }

    removeIssues(uri) {
        this.issues.remove(uri);
    }
}

module.exports = Formatter;
