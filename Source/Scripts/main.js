//
// RuboCop Extension for Nova
// main.js
//
// Copyright © 2019-2020 Justin Mecham. All rights reserved.
//

const Linter = require("./Linter");
const Formatter = require("./Formatter");

exports.activate = function () {
    const linter = new Linter();
    const formatter = new Formatter();
    let format = false;
    
    nova.workspace.config.observe(
			'rubocop.format-on-save',
			() => format = nova.workspace.config.get('rubocop.format-on-save')
      
		)
		
    
    nova.workspace.onDidAddTextEditor((editor) => {
        linter.lintDocument(editor.document);

        editor.onWillSave((editor) => {
          linter.lintDocument(editor.document)
          if (format) {
              formatter.formatDocument(editor.document)
          }
        });

        editor.onDidStopChanging((editor) =>
            linter.lintDocument(editor.document)
        );

        editor.document.onDidChangeSyntax((document) =>
            linter.lintDocument(document)
        );

        editor.onDidDestroy((destroyedEditor) => {
            let anotherEditor = nova.workspace.textEditors.find((editor) => {
                return editor.document.uri === destroyedEditor.document.uri;
            });

            if (!anotherEditor) {
                linter.removeIssues(destroyedEditor.document.uri);
            }
        });
    });
};
