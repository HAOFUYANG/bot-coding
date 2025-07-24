import * as vscode from "vscode";
import { execSync } from "child_process";

/**
 * @description 检查 Node.js 版本是否符合要求
 * @returns
 */
function checkNodeVersion() {
  console.log('execSync("node -v") :>> ', execSync("node -v"));
  const version = execSync("node -v").toString().trim();
  console.log("version :>> ", version);
  return {
    version,
    result: parseInt(version.replace("v", "").split(".")[0]) >= 18,
  };
}

/**
 * @description 检查是否安装脚手架
 * @returns
 */
function checkHappyCliInstalled() {
  try {
    const output = execSync("npm list -g @happy.cli/cli").toString();
    return output.includes("@happy.cli/cli");
  } catch (e) {
    return false;
  }
}
function installHappyCli() {
  const terminal = vscode.window.createTerminal("安装 Happy CLI");
  console.log("terminal :>> ", terminal);
  terminal.show();
  terminal.sendText("npm install -g @happy.cli/cli", true);
}

export { checkNodeVersion, checkHappyCliInstalled, installHappyCli };
