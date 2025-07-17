const vscode = require("vscode");

let outputChannel = null;

function initLogger() {
  outputChannel = vscode.window.createOutputChannel("InlineAutoGenerator");
  outputChannel.show(true);
  return outputChannel;
}

function log(message) {
  if (outputChannel) {
    outputChannel.appendLine(message);
  }
}

module.exports = {
  initLogger,
  log,
};
