import { callable, controller } from "cec-client-server/decorator";
import { exec } from "child_process";
import * as vscode from "vscode";

/**
 * Git控制器类，用于处理Git相关的操作
 * 提供获取远程仓库信息和提交推送代码的功能
 */
@controller("Git")
export class GitController {
  constructor() {}

  /**
   * 获取当前工作目录下的所有Git远程仓库信息
   * 执行git remote -v命令来获取远程仓库列表
   * @returns Promise对象，包含远程仓库数组和当前工作目录路径
   *          remotes: 远程仓库名称数组
   *          cwd: 当前工作目录路径
   */
  @callable("getRemotesWithPath")
  async getRemotesWithPath(): Promise<{ remotes: string[]; cwd: string }> {
    const folder = vscode.workspace.workspaceFolders?.[0];
    if (!folder) {
      return { remotes: [], cwd: "" };
    }

    const cwd = folder.uri.fsPath;

    // 执行git remote -v命令获取远程仓库信息
    return new Promise((resolve, reject) => {
      exec("git remote -v", { cwd }, (err, stdout) => {
        if (err) {
          console.error("获取远程仓库失败:", err);
          return reject(err);
        }
        console.log("stdout :>> ", stdout);
        // 解析命令输出，提取远程仓库名称
        const remotes = stdout
          .split("\n")
          .map((line) => line.split("\t")[0])
          .filter(Boolean);
        resolve({ remotes, cwd });
      });
    });
  }

  /**
   * 执行Git提交并推送到远程仓库的操作
   * 包含添加所有文件、提交和推送三个步骤
   * @param data 包含提交信息的对象
   *        commitMessage: 提交信息
   *        remoteName: 远程仓库名称
   * @returns Promise对象，包含操作结果信息
   */
  @callable("commitAndPush")
  async commitAndPush(data: any): Promise<any> {
    const { commitMessage, remoteName } = data;
    const cwd = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

    // 执行git add、commit和push命令序列
    return new Promise((resolve, reject) => {
      exec(
        `git add . && git commit -m "${commitMessage}" && git push ${remoteName} HEAD`,
        { cwd },
        (err, stdout, stderr) => {
          return resolve({ success: !err, err: err ? stderr : stdout });
        }
      );
    });
  }
}
