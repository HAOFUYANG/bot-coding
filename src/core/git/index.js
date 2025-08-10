import { exec } from "child_process";
import * as vscode from "vscode";
import { postMessage, Msg } from "../Messager";

const gitActionsInit = () => {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) {
    return;
  }
  const cwd = folder.uri.fsPath;
  exec("git remote -v", { cwd }, (err, stdout) => {
    if (err) {
      console.error("错误");
    }
    const remotes = stdout
      .split("\n")
      .map((line) => line.split("\t")[0])
      .filter(Boolean);

    postMessage({
      type: Msg.GIT_ACTIONS_GET_REMOTES_WITH_PATH,
      payload: {
        remotes,
        cwd,
      },
    });
  });
};
const commitAndPush = (message) => {
  const { commitMessage, remoteName } = message.payload;
  const cwd = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  exec(
    `git add . && git commit -m "${commitMessage}" && git push ${remoteName} HEAD`,
    { cwd },
    (err, stdout, stderr) => {
      console.log("err", err, stdout, stderr);
      postMessage({
        type: Msg.GIT_ACTIONS_COMMIT_AND_PUSH,
        payload: { success: !err, err: err ? stderr : stdout },
      });
    }
  );
};

export { gitActionsInit, commitAndPush };
