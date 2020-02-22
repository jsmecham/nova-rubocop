//
// RuboCop Extension for Nova
// Offense.js
//
// Copyright © 2019-2020 Justin Mecham. All rights reserved.
//

class Offense {

    constructor(attributes) {
        this.severity = attributes["severity"];
        this.cop = attributes["cop_name"];
        this.message = attributes["message"];
        this.startColumn = attributes["location"]["start_column"];
        this.startLine = attributes["location"]["start_line"];
        this.stopColumn = attributes["location"]["last_column"];
        this.stopLine = attributes["location"]["last_line"];
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
        issue.endLine = this.stopLine;
        issue.column = this.startColumn;
        issue.endColumn = this.stopColumn + 1;

        return issue;
    }

}

module.exports = Offense;
