import * as vscode from "vscode";
import { execSync } from "child_process";

/**
 * @description 检查 Node.js 版本是否符合要求
 * @returns
 */
function checkNodeVersion() {
  const version = execSync("node -v", { encoding: "utf-8" }).trim();
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
/**
 * @description 安装 Happy CLI
 */
function installHappyCli() {
  const terminal = vscode.window.createTerminal("安装 Happy CLI");
  console.log("terminal :>> ", terminal);
  terminal.show();
  terminal.sendText("npm install -g @happy.cli/cli", true);
}
/**
 * @description 使用 Create Happy App 方式创建应用
 */
function createHappyApp() {
  const terminal = vscode.window.createTerminal("Create Happy App构建模版");
  terminal.show();
  terminal.sendText(
    "npx create-happy-app my-app --type project -p template-vue",
    true
  );
}

export {
  checkNodeVersion,
  checkHappyCliInstalled,
  installHappyCli,
  createHappyApp,
};
