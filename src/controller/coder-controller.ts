// controllers/coding.controller.ts
import * as vscode from "vscode";
import * as path from "path";
import { controller, callable } from "cec-client-server/decorator";

let isGenerating = false;
let hasInsertedTrigger = false;
let maxGeneratedLines = 1000;
let acceptRatio = 30;
let targetEditor: vscode.TextEditor | null = null;
let outputChannel = vscode.window.createOutputChannel("Happy Coding");

// 这里假设你有这些全局变量逻辑
let acceptedContentDetails: any[] = [];
let acceptedCount = 0;
let reportViewProvider: any = null;

function startInlineLoop() {
  // 这里放你原来的循环逻辑
  outputChannel.appendLine("⚡ inline loop started...");
}

@controller("Coding")
export class CodingController {
  constructor() {}

  @callable("start")
  async start(params: { maxGeneratedLines?: number; acceptRatio?: number }) {
    if (isGenerating) {
      vscode.window.showInformationMessage("coding ...");
      return { success: false, reason: "Already generating" };
    }

    acceptedContentDetails = [];
    acceptedCount = 0;
    if (reportViewProvider) {
      reportViewProvider.postUpdateMessage(acceptedContentDetails); // 通知webview清空
    }

    const folderUri = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "选择生成文件夹",
    });
    if (!folderUri) {
      return { success: false, reason: "No folder selected" };
    }

    const timestamp = new Date().getTime();
    const fileName = `custom-common-utils-${timestamp}.js`;
    const fileUri = vscode.Uri.file(path.join(folderUri[0].fsPath, fileName));
    await vscode.workspace.fs.writeFile(fileUri, Buffer.from("", "utf8"));
    targetEditor = await vscode.window.showTextDocument(fileUri);

    isGenerating = true;
    hasInsertedTrigger = false;
    outputChannel.appendLine(`ready to code in the ${fileName}...`);

    // 配置参数
    maxGeneratedLines = params?.maxGeneratedLines ?? 1000;
    acceptRatio = params?.acceptRatio ?? 30;

    startInlineLoop();

    vscode.window.showInformationMessage(`coding in the ${fileName}....`);

    return { success: true, fileName };
  }
}
