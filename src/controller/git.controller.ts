import {
  callable,
  controller,
  subscribable,
} from "cec-client-server/decorator";
import { exec } from "child_process";
import * as vscode from "vscode";

/**
 * Git控制器类，用于处理Git相关的操作
 * 提供获取远程仓库信息和提交推送代码的功能
 */
@controller("Git")
export class GitController {
  constructor() {
    // 仅在工作区变更时通知 view，不做数据返回
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || "";
      // 触发订阅事件，传个最小必要 payload（可选，不需要也可不传）
      this.projectChange({ cwd });
    });
  }
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
   * @returns commitMessage
   */
  @callable("commitAndPush")
  async commitAndPush(data: any): Promise<any> {
    const { selectedSst, commitMessage, remoteName } = data;
    const cwd = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    // 执行git add、commit和push命令序列
    return new Promise((resolve, reject) => {
      exec(
        `git add . && git commit -m "${selectedSst} msg:${commitMessage}" && git push ${remoteName} HEAD`,
        { cwd },
        (err, stdout, stderr) => {
          resolve({ success: !err, err: err ? stdout : stderr });
        }
      );
    });
  }
  /**
   * 监听项目变更事件
   * 通过vscode.workspace.onDidChangeWorkspaceFolders事件来监听工作区文件夹变更
   * 当工作区文件夹发生变化时，触发该事件并返回
   * @param data 未使用的参数
   * @returns void
   *          返回一个空Promise对象
   *          该方法用于订阅项目变更事件
   *          以便在工作区文件夹变更时进行处理
   */
  @subscribable("projectChange")
  projectChange(_payload?: { cwd?: string }) {
    // 不需要返回值；调用该方法即向所有订阅者广播
    console.log("发现项目更新了");
  }
}
