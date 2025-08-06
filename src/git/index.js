import { exec } from "child_process";
import * as vscode from "vscode";
import { postMessage, Msg } from "../core/webviewMessager";

const gitActionsInit = () => {
  const folder = vscode.workspace.workspaceFolders?.[0];
  console.log("folder :>> ", folder);
  if (!folder) {
    return;
  }
  const cwd = folder.uri.fsPath;
  exec("git remote -v", { cwd }, (err, stdout) => {
    if (err) {
      console.error("错误");
    }
    const remotes = [
      ...new Set(
        stdout
          .split("\n")
          .map((line) => line.split("\t")[0])
          .filter(Boolean)
      ),
    ];
    postMessage({
      type: Msg.GIT_ACTIONS_INIT,
      payload: remotes,
    });
  });
};
export { gitActionsInit };
