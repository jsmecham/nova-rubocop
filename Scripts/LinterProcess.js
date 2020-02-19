// 
// RuboCop Extension for Nova
// LinterProcess.js
//
// Copyright © 2019-2020 Justin Mecham. All rights reserved.
// 

const Offense = require("Offense");

class LinterProcess {

  constructor(path, content = null) {
    this.path = path;
    this.content = content;
  }

  get process() {
    if (this._process) return this._process;
    
    let args = ""
    if(nova.config.get('Mecham.Rubocop.UseBundler')) {
      args = ["bundle", "exec", "rubocop", "--format=json", "--stdin", this.path]
    } else {
      args = ["rubocop", "--format=json", "--stdin", this.path]
    }

    const process = new Process("/usr/bin/env", {
      args: args,
      cwd: nova.workspace.path,
      stdio: "pipe",
    });

    process.onStdout(this.handleOutput.bind(this));
    process.onStderr(this.handleError.bind(this));

    return (this._process = process);
  }

  execute() {
    this.process.start();

    const channel = this.process.stdin;
    const writer = channel.getWriter();

    writer.ready.then(() => {
      writer.write(this.content);
      writer.close();
    });
  }

  handleError(error) {
    console.error(error);
  }

  handleOutput(output) {
    const parsedOutput = JSON.parse(output);
    const offenses = parsedOutput["files"][0]["offenses"];

    console.info(JSON.stringify(offenses, null, "  "));

    this.offenses = offenses.map(offense => new Offense(offense));

    if (this._onCompleteCallback) {
      this._onCompleteCallback(this.offenses);
    }
  }

  onComplete(callback) {
    this._onCompleteCallback = callback;
  }

}

module.exports = LinterProcess;
