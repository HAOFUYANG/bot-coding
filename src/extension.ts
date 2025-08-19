import "reflect-metadata";
import * as vscode from "vscode";
import * as path from "path";
import { insertRandomSnippet } from "./utils/insertRandomSnippet";
import { happyCliInit } from "./core/cli/index";
import * as messager from "./core/Messager/index";
import { postMessage, Msg } from "./core/Messager/index";
import {
  checkNodeVersion,
  checkHappyCliInstalled,
  installHappyCli,
  createHappyApp,
} from "./utils/happyCliUtils";
import "./controller/index";
import { getControllers } from "cec-client-server/decorator";
import { CecServer } from "cec-client-server";
import { ContextService } from "@/service/context.service";

let isGenerating = false;
let targetEditor: vscode.TextEditor | null = null;
let outputChannel: vscode.OutputChannel | null = null;
let loopTimer: NodeJS.Timeout | null = null;
let hasInsertedTrigger = false;
let maxGeneratedLines = 1000;
let acceptRatio = 25;
let acceptedContentDetails: any[] = [];
let acceptedCount = 0;
let reportViewProvider: InlineReportViewProvider | null = null;

async function triggerAndAcceptInline(): Promise<void> {
  if (!isGenerating || !targetEditor) {
    return;
  }
  if (targetEditor.document.lineCount >= maxGeneratedLines) {
    outputChannel?.appendLine(`code generation completed, max line reached.`);
    isGenerating = false;
    stopInlineLoop();
    vscode.window.showInformationMessage(
      `code generation completed, stop coding`
    );
    targetEditor.document.save().then(() => {
      outputChannel?.appendLine("save success");
    });
    return;
  }
  try {
    if (!hasInsertedTrigger) {
      await targetEditor.edit((editBuilder) => {
        editBuilder.insert(targetEditor!.selection.active, "const");
      });
      outputChannel?.appendLine("first trigger success");
      hasInsertedTrigger = true;
    }
    const prevLineCount = targetEditor.document.lineCount;
    await vscode.commands.executeCommand("editor.action.inlineSuggest.trigger");
    outputChannel?.appendLine("trigger inline suggestion");
    const currentLineCount = targetEditor.document.lineCount;
    const generatedRatio = acceptedCount / currentLineCount;
    const shouldAccept = Math.random() < acceptRatio / 100 - generatedRatio;
    let didAccept = false;
    if (shouldAccept) {
      await vscode.commands.executeCommand(
        "editor.action.inlineSuggest.commit"
      );
      await targetEditor.document.save().then(() => {
        outputChannel?.appendLine(
          "accept inline suggestion success and save once"
        );
      });
      didAccept = true;
    } else {
      await insertRandomSnippet(targetEditor);
      outputChannel?.appendLine(
        "insert random code block instead of accepting"
      );
    }
    const newLineCount = targetEditor.document.lineCount;
    let addedContent = "";
    if (newLineCount > prevLineCount) {
      for (let i = prevLineCount - 1; i < newLineCount - 1; i++) {
        addedContent += targetEditor.document.lineAt(i).text + "\n";
      }
    } else {
      const lastLineNumber = newLineCount - 2;
      if (lastLineNumber >= 0) {
        addedContent = targetEditor.document.lineAt(lastLineNumber).text;
      }
    }
    if (didAccept) {
      acceptedCount++;
      acceptedContentDetails.push({
        count: acceptedCount,
        prevLineCount,
        newLineCount,
        content: addedContent.trim(),
      });
      if (reportViewProvider) {
        reportViewProvider.postUpdateMessage(acceptedContentDetails);
      }
    }
    await moveCursorToEndAndInsertNewLine(targetEditor);
    if (shouldTriggerOnEmptyLines(targetEditor, 3, 2)) {
      outputChannel?.appendLine("insert words for empty line to ");
      await insertTriggerWord(targetEditor);
    }
  } catch (e: any) {
    outputChannel?.appendLine(`[triggerAndAcceptInline] error: ${e.message}`);
  }
}

async function moveCursorToEndAndInsertNewLine(
  editor: vscode.TextEditor | null
): Promise<void> {
  if (!editor) {
    return;
  }
  const lastLine = editor.document.lineCount - 1;
  const lastLineLength = editor.document.lineAt(lastLine).text.length;
  const endPosition = new vscode.Position(lastLine, lastLineLength);
  editor.selection = new vscode.Selection(endPosition, endPosition);
  editor.revealRange(new vscode.Range(endPosition, endPosition));
  await editor.edit((editBuilder) => {
    editBuilder.insert(endPosition, "\n");
  });
}

async function scanBotFilesAndUpdate(
  reportViewProvider: InlineReportViewProvider | null
): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders && workspaceFolders.length > 0) {
    const files = await vscode.workspace.findFiles(
      "**/custom-common-utils-*.js"
    );
    const result = files.map((fileUri) => ({
      name: path.basename(fileUri.fsPath),
      path: fileUri.fsPath,
    }));
    reportViewProvider?.postUpdateBotFiles(result);
  }
}

function shouldTriggerOnEmptyLines(
  editor: vscode.TextEditor,
  linesCount = 3,
  emptyThreshold = 2
): boolean {
  const doc = editor.document;
  const totalLines = doc.lineCount;
  let emptyLines = 0;
  for (let i = totalLines - 1; i >= Math.max(0, totalLines - linesCount); i--) {
    const text = doc.lineAt(i).text.trim();
    if (text === "") {
      emptyLines++;
    }
  }
  return emptyLines > emptyThreshold;
}

async function insertTriggerWord(editor: vscode.TextEditor): Promise<void> {
  const lastLine = editor.document.lineCount - 1;
  const lastLineLength = editor.document.lineAt(lastLine).text.length;
  const endPosition = new vscode.Position(lastLine, lastLineLength);
  await editor.edit((editBuilder) => {
    editBuilder.insert(endPosition, "\nconst getData =");
  });
}

function startInlineLoop(minDelay = 1000, maxDelay = 2000): void {
  async function loop() {
    if (!isGenerating) return;
    await triggerAndAcceptInline();
    const delayMs =
      Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;
    loopTimer = setTimeout(loop, delayMs);
  }
  loop();
}

export function activate(context: vscode.ExtensionContext): void {
  ContextService.register(context);
  outputChannel = vscode.window.createOutputChannel("InlineAutoGenerator");
  context.subscriptions.push(outputChannel);
  outputChannel.show(true);

  reportViewProvider = new InlineReportViewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("coder-view", reportViewProvider)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("coding.start", async (args) => {
      if (isGenerating) {
        vscode.window.showInformationMessage("coding ...");
        return;
      }
      acceptedContentDetails = [];
      acceptedCount = 0;
      if (reportViewProvider) {
        reportViewProvider.postUpdateMessage(acceptedContentDetails);
      }
      const folderUri = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "选择生成文件夹",
      });
      if (!folderUri) {
        return;
      }
      const timestamp = new Date().getTime();
      const fileName = `custom-common-utils-${timestamp}.js`;
      const fileUri = vscode.Uri.file(path.join(folderUri[0].fsPath, fileName));
      await vscode.workspace.fs.writeFile(fileUri, Buffer.from("", "utf8"));
      targetEditor = await vscode.window.showTextDocument(fileUri);

      isGenerating = true;
      hasInsertedTrigger = false;
      outputChannel.appendLine(`ready to code in the ${fileName}...`);

      let maxLines = args?.maxGeneratedLines;
      if (!maxLines) {
        const inputMaxLines = await vscode.window.showInputBox({
          prompt: "请输入要生成的最大行数（超过后自动停止）",
          placeHolder: "默认1000",
          validateInput: (value) => {
            if (value && isNaN(Number(value))) {
              return "请输入数字";
            }
            return null;
          },
        });
        maxLines = inputMaxLines ? Number(inputMaxLines) : 1000;
      }
      maxGeneratedLines = maxLines;
      acceptRatio = args?.acceptRatio ?? 30;
      startInlineLoop();
      vscode.window.showInformationMessage(`coding in the ${fileName}....`);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("coding.stop", () => {
      if (!isGenerating) {
        vscode.window.showInformationMessage("doing nothing...");
        return;
      }
      targetEditor?.document.save().then(() => {
        outputChannel?.appendLine("save success!");
      });
      isGenerating = false;
      targetEditor = null;
      stopInlineLoop();
      outputChannel?.appendLine("stop inline generator success");
      vscode.window.showInformationMessage("stop inline generator success");
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("autoInlineGenerator.tab", async () => {
      outputChannel?.appendLine("=== 要开始tab了 ===");
      await vscode.commands.executeCommand(
        "editor.action.inlineSuggest.commit"
      );
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("scanBotFiles", async () => {
      await scanBotFilesAndUpdate(reportViewProvider);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("openBotFile", async (filePath: string) => {
      const uri = vscode.Uri.file(filePath);
      await vscode.window.showTextDocument(uri);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "deleteBotFile",
      async (filePath: string) => {
        const uri = vscode.Uri.file(filePath);
        await vscode.workspace.fs.delete(uri);
        vscode.window.showInformationMessage(`文件已删除: ${filePath}`);
        await scanBotFilesAndUpdate(reportViewProvider);
      }
    )
  );
}

class InlineReportViewProvider implements vscode.WebviewViewProvider {
  private _context: vscode.ExtensionContext;
  private _webviewView: vscode.WebviewView | null = null;
  private _webview: vscode.Webview | undefined;

  constructor(context: vscode.ExtensionContext) {
    this._context = context;
  }

  postGenerationStopped(): void {
    if (this._webview) {
      this._webview.postMessage({
        type: "GENERATION_STOPPED",
      });
    }
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this._webview = webviewView.webview;
    const mediaPath = vscode.Uri.file(
      path.join(this._context.extensionPath, "media")
    );
    messager.setWebview(this._webview);
    const webview = webviewView.webview;
    webview.options = {
      enableScripts: true,
      localResourceRoots: [mediaPath],
    };

    if (false) {
      webview.html = `
   <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dev Coder View</title>
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'none';
    img-src http://localhost:5173 data:;
    script-src 'unsafe-eval' 'unsafe-inline' http://localhost:5173;
    style-src 'unsafe-inline' http://localhost:5173;
    connect-src http://localhost:5173 ws://localhost:5173;
    frame-src http://localhost:5173;">
</head>
<body style="margin:0;padding:0;overflow:hidden;height:100vh;width:100vw;">
  <iframe src="http://localhost:5173" style="width:100%; height:100%; border:none;"></iframe>
</body>
</html>
      `;
    } else {
      const htmlUri = vscode.Uri.file(
        path.join(this._context.extensionPath, "media", "index.html")
      );
      vscode.workspace.fs.readFile(htmlUri).then((buffer) => {
        let html = buffer.toString("utf8");
        html = html.replace(/(src|href)="(.+?)"/g, (_, attr, relativePath) => {
          const resourcePath = vscode.Uri.file(
            path.join(this._context.extensionPath, "media", relativePath)
          );
          return `${attr}="${webview.asWebviewUri(resourcePath)}"`;
        });
        webview.html = html;

        const { callables, subscribables } = getControllers();
        const cecServer = new CecServer(
          webview.postMessage.bind(webview),
          webview.onDidReceiveMessage.bind(webview)
        );
        Object.entries(callables).forEach(([name, handler]) =>
          cecServer.onCall(name, handler)
        );
        Object.entries(subscribables).forEach(([name, handler]) =>
          cecServer.onSubscribe(name, handler)
        );
      });
    }

    webview.onDidReceiveMessage(async (message) => {
      if (message.command === "coding.start") {
        const { maxGeneratedLines, acceptRatio } = message.params;
        vscode.commands.executeCommand("coding.start", {
          maxGeneratedLines,
          acceptRatio,
        });
      }
      if (message.command === "coding.stop") {
        vscode.commands.executeCommand("coding.stop");
      }
      if (message.command === "scanBotFiles") {
        vscode.commands.executeCommand("scanBotFiles");
      }
      if (message.command === "openBotFile") {
        vscode.commands.executeCommand("openBotFile", message.path);
      }
      if (message.command === "deleteBotFile") {
        vscode.commands.executeCommand("deleteBotFile", message.path);
      }
      if (message.command === Msg.HAPPY_CLI_INIT) {
        await happyCliInit(message);
      }
      if (message.command === Msg.HAPPY_CLI_CHECK_ENVIRONMENT) {
        const nodeVersionCheckResult = checkNodeVersion();
        const cliInstalled = checkHappyCliInstalled();
        postMessage({
          type: Msg.HAPPY_CLI_CHECK_ENVIRONMENT,
          payload: {
            nodeVersionCheckResult,
            cliInstalled,
          },
        });
      }
      if (message.command === Msg.HAPPY_CLI_INSTALL_CLI) {
        installHappyCli();
      }
      if (message.command === Msg.HAPPY_CLI_CREATE__APP) {
        createHappyApp();
      }
    });
  }

  postUpdateMessage(data: any): void {
    if (this._webview) {
      this._webview.postMessage({
        type: "UPDATE",
        acceptedContentDetails: data,
      });
    }
  }

  postUpdateBotFiles(files: any): void {
    if (this._webview) {
      this._webview.postMessage({
        type: "BOT_FILES",
        botFiles: files,
      });
    }
  }
}

function stopInlineLoop(): void {
  if (loopTimer) {
    clearTimeout(loopTimer);
    loopTimer = null;
  }
  if (reportViewProvider) {
    reportViewProvider.postGenerationStopped();
  }
}

export function deactivate(): void {
  isGenerating = false;
  stopInlineLoop();
  if (reportViewProvider) {
    reportViewProvider.postGenerationStopped();
  }
}
