// 
// RuboCop Extension for Nova
// main.js
//
// Copyright © 2019 Justin Mecham. All rights reserved.
// 

const disposables = new CompositeDisposable();
const RuboCop = require("RuboCop");

exports.activate = function() {
    const ruboCopInstance = new RuboCop();
    disposables.add(ruboCopInstance);
}

exports.deactivate = function() {
    disposables.dispose();
}
