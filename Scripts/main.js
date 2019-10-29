// 
// RuboCop Extension for Nova
// main.js
//
// Copyright © 2019 Justin Mecham. All rights reserved.
// 

const RuboCopIssuesProvider = require("issuesProvider");
let disposables = new CompositeDisposable();

exports.activate = function() {
    console.log("Activating");
    
    const issuesProvider = new RuboCopIssuesProvider();
    nova.workspace.onDidAddTextEditor(issuesProvider.addTextEditor.bind(issuesProvider));
    disposables.add(nova.assistants.registerIssueAssistant("ruby", issuesProvider));
}

exports.deactivate = function() {
    console.log("Deactivating");
    
    disposables.dispose();
}
