// 
// RuboCop for Nova
// offense.js
//
// Copyright © 2019 Justin Mecham. All rights reserved.
// 

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

module.exports = RuboCopOffense;