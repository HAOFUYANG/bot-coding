import * as vscode from "vscode";

let outputChannel: NonNullable<any> = null;

function initLogger() {
  outputChannel = vscode.window.createOutputChannel("InlineAutoGenerator");
  outputChannel.show(true);
  return outputChannel;
}

function log(message: string) {
  if (outputChannel) {
    outputChannel.appendLine(message);
  }
}

export { initLogger, log };
