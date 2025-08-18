import "reflect-metadata";
// 将CommonJS引入方式改为ES模块引入
import * as vscode from "vscode";
import * as path from "path";
import { insertRandomSnippet } from "./utils/insertRandomSnippet.js";
import { happyCliInit } from "./core/cli/index.js";
import * as messager from "./core/Messager/index.js";
import { postMessage, Msg } from "./core/Messager/index.js";
import {
  checkNodeVersion,
  checkHappyCliInstalled,
  installHappyCli,
  createHappyApp,
} from "./utils/happyCliUtils.js";
//注册cecClient
import "./controller";
import { getControllers } from "cec-client-server/decorator";
import { CecServer } from "cec-client-server";
import { ContextService } from "@/service/context.service";
let isGenerating = false;
let targetEditor = null;
let outputChannel = null;
let loopTimer = null;
let hasInsertedTrigger = false;
let maxGeneratedLines = 1000;
let acceptRatio = 25;
let acceptedContentDetails = []; //记录采纳的详细信息
let acceptedCount = 0; // 记录采纳的次数
let reportViewProvider = null;

/**
 * @description 触发内联建议并采纳。
 * @returns {Promise<void>}
 */
async function triggerAndAcceptInline() {
  if (!isGenerating || !targetEditor) {
    return;
  }
  //最大行数限制检测
  if (targetEditor.document.lineCount >= maxGeneratedLines) {
    outputChannel.appendLine(`code generation completed, max line reached.`);
    isGenerating = false;
    stopInlineLoop();
    vscode.window.showInformationMessage(
      `code generation completed, stop coding`
    );
    targetEditor.document.save().then(() => {
      outputChannel.appendLine("save success");
    });
    return;
  }
  try {
    if (!hasInsertedTrigger) {
      // 1.插入触发词------>第一次插入触发词
      await targetEditor.edit((editBuilder) => {
        editBuilder.insert(targetEditor.selection.active, "const");
      });
      outputChannel.appendLine("first trigger success");
      hasInsertedTrigger = true;
    }
    // 2.触发----------->inline suggestion
    const prevLineCount = targetEditor.document.lineCount;
    await vscode.commands.executeCommand("editor.action.inlineSuggest.trigger");
    outputChannel.appendLine("trigger inline suggestion");
    // 3.采纳---------> inline suggest
    // --------------------------随机采纳判断逻辑---------------------------
    const currentLineCount = targetEditor.document.lineCount;
    const generatedRatio = acceptedCount / currentLineCount;
    const shouldAccept = Math.random() < acceptRatio / 100 - generatedRatio;
    let didAccept = false;
    if (shouldAccept) {
      await vscode.commands.executeCommand(
        "editor.action.inlineSuggest.commit"
      );
      //4.保存----------->执行一次save
      await targetEditor.document.save().then(() => {
        outputChannel.appendLine(
          "accept inline suggestion success and save once"
        );
      });
      didAccept = true;
    } else {
      await insertRandomSnippet(targetEditor);
      outputChannel.appendLine("insert random code block instead of accepting");
    }

    //5.获取采纳的内容--------->通过行判断获取当前被采纳内容
    const newLineCount = targetEditor.document.lineCount;
    let addedContent = "";
    // 如果有新增行，就把这些行全部拼接起来
    if (newLineCount > prevLineCount) {
      for (let i = prevLineCount - 1; i < newLineCount - 1; i++) {
        addedContent += targetEditor.document.lineAt(i).text + "\n";
      }
    } else {
      // 如果没有增加行（可能是末行直接插入），就拿倒数第二行（因为你后面还插了换行）
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
      // 5.发送数据到webview
      if (reportViewProvider) {
        reportViewProvider.postUpdateMessage(acceptedContentDetails);
      }
    }
    // 6.光标移动然后换行--------->准备下次 inline suggestion
    await moveCursorToEndAndInsertNewLine(targetEditor);
    // 7.空行检测----------->如果存在空行，主动做一次触发内联推荐
    if (shouldTriggerOnEmptyLines(targetEditor, 3, 2)) {
      outputChannel.appendLine("insert words for empty line to ");
      await insertTriggerWord(targetEditor);
    }
  } catch (e) {
    outputChannel.appendLine(`[triggerAndAcceptInline] error: ${e.message}`);
  }
}

/**
 * @description 将光标移动到当前编辑器文件的最后一行最后一个字符，并在该处插入换行。
 * @param {vscode.TextEditor} editor
 */
async function moveCursorToEndAndInsertNewLine(editor) {
  if (!editor) {
    return;
  }
  const lastLine = editor.document.lineCount - 1;
  const lastLineLength = editor.document.lineAt(lastLine).text.length;
  const endPosition = new vscode.Position(lastLine, lastLineLength);
  // 移动光标到最后
  editor.selection = new vscode.Selection(endPosition, endPosition);
  // 可选: 确保滚动到可见
  editor.revealRange(new vscode.Range(endPosition, endPosition));
  // 在最后插入换行
  await editor.edit((editBuilder) => {
    editBuilder.insert(endPosition, "\n");
  });
}
/**
 * @description 项目扫描
 * @param {*} reportViewProvider
 */
async function scanBotFilesAndUpdate(reportViewProvider) {
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
/**
 * 检查最近 n 行里是否有超过 m 行是空行
 * @param {vscode.TextEditor} editor
 * @param {number} linesCount 最近多少行
 * @param {number} emptyThreshold 超过多少空行就触发
 * @returns {boolean}
 */
function shouldTriggerOnEmptyLines(editor, linesCount = 3, emptyThreshold = 2) {
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

/**
 * @description 在最后插入触发词（例如 const），用于重新触发 inline suggest
 * @param {vscode.TextEditor} editor
 */
async function insertTriggerWord(editor) {
  const lastLine = editor.document.lineCount - 1;
  const lastLineLength = editor.document.lineAt(lastLine).text.length;
  const endPosition = new vscode.Position(lastLine, lastLineLength);
  await editor.edit((editBuilder) => {
    editBuilder.insert(endPosition, "\nconst getData =");
  });
}

function startInlineLoop(minDelay = 1000, maxDelay = 2000) {
  async function loop() {
    if (!isGenerating) return;

    await triggerAndAcceptInline();
    const delayMs =
      Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;
    loopTimer = setTimeout(loop, delayMs);
  }
  loop();
}

function activate(context) {
  ContextService.register(context);
  outputChannel = vscode.window.createOutputChannel("InlineAutoGenerator");
  context.subscriptions.push(outputChannel);
  // 把 ExtensionContext 注册到容器
  outputChannel.show(true);

  reportViewProvider = new InlineReportViewProvider(context);
  //注册panel的html页面
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("coder-view", reportViewProvider)
  );
  //注册命令
  context.subscriptions.push(
    vscode.commands.registerCommand("coding.start", async (args) => {
      if (isGenerating) {
        vscode.window.showInformationMessage("coding ...");
        return;
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

      // 从 args 获取参数
      let maxLines = args?.maxGeneratedLines;
      //  如果没传入参数，则用 inputBox 询问
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
      //生成行数配置
      maxGeneratedLines = maxLines;
      //采纳率配置
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
      targetEditor.document.save().then(() => {
        outputChannel.appendLine("save success!");
      });
      isGenerating = false;
      targetEditor = null;
      stopInlineLoop();
      outputChannel.appendLine("stop inline generator success");
      vscode.window.showInformationMessage("stop inline generator success");
    })
  );
  context.subscriptions.push(
    //预留一个命令的注册
    vscode.commands.registerCommand("autoInlineGenerator.tab", async () => {
      outputChannel.appendLine("=== 要开始tab了 ===");
      await vscode.commands.executeCommand(
        "editor.action.inlineSuggest.commit"
      );

      // [
      //   "editor.action.inlineSuggest.trigger",
      //   "editor.action.inlineSuggest.triggerInlineEditExplicit",
      //   "editor.action.inlineSuggest.triggerInlineEdit",
      //   "editor.action.inlineSuggest.showNext",
      //   "editor.action.inlineSuggest.showPrevious",
      //   "editor.action.inlineSuggest.acceptNextWord",
      //   "editor.action.inlineSuggest.acceptNextLine",
      //   "editor.action.inlineSuggest.commit",
      //   "editor.action.inlineSuggest.toggleShowCollapsed",
      //   "editor.action.inlineSuggest.hide",
      //   "editor.action.inlineSuggest.jump",
      //   "editor.action.inlineSuggest.toggleAlwaysShowToolbar",
      //   "editor.action.inlineSuggest.dev.extractRepro",
      // ];
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("scanBotFiles", async () => {
      await scanBotFilesAndUpdate(reportViewProvider);
    })
  );
  //打开指定文件到编辑器
  context.subscriptions.push(
    vscode.commands.registerCommand("openBotFile", async (filePath) => {
      const uri = vscode.Uri.file(filePath);
      await vscode.window.showTextDocument(uri);
    })
  );
  //删除选中的文件
  context.subscriptions.push(
    vscode.commands.registerCommand("deleteBotFile", async (filePath) => {
      const uri = vscode.Uri.file(filePath);
      await vscode.workspace.fs.delete(uri);
      vscode.window.showInformationMessage(`文件已删除: ${filePath}`);
      await scanBotFilesAndUpdate(reportViewProvider);
    })
  );
}
class InlineReportViewProvider {
  constructor(context) {
    this._context = context;
    this._webviewView = null;
  }

  //停止事件
  postGenerationStopped() {
    if (this._webview) {
      this._webview.postMessage({
        type: "GENERATION_STOPPED",
      });
    }
  }
  //获取webviewView
  resolveWebviewView(webviewView) {
    this._webview = webviewView.webview;
    const mediaPath = vscode.Uri.file(
      path.join(this._context.extensionPath, "media")
    );
    //消息中心注入webview
    messager.setWebview(this._webview); // 注入 webview
    const webview = webviewView.webview;
    webview.options = {
      enableScripts: true,
      localResourceRoots: [mediaPath],
    };

    const isDevMode = process.env.NODE_ENV === "development"; // 你可以用 cross-env 设置
    if (false) {
      // 本地开发模式直接指向 vite
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
        // 替换静态资源路径为 webview 可访问的 Uri
        html = html.replace(/(src|href)="(.+?)"/g, (_, attr, relativePath) => {
          const resourcePath = vscode.Uri.file(
            path.join(this._context.extensionPath, "media", relativePath)
          );
          return `${attr}="${webview.asWebviewUri(resourcePath)}"`;
        });

        webview.html = html;

        //注册通讯
        // 手动实例化 Controller

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

    //接受消息
    webview.onDidReceiveMessage(async (message) => {
      //代码生成
      if (message.command === "coding.start") {
        const { maxGeneratedLines, acceptRatio } = message.params;
        vscode.commands.executeCommand("coding.start", {
          maxGeneratedLines,
          acceptRatio,
        });
      }
      //代码停止
      if (message.command === "coding.stop") {
        vscode.commands.executeCommand("coding.stop");
      }
      //项目文件扫描
      if (message.command === "scanBotFiles") {
        vscode.commands.executeCommand("scanBotFiles");
      }
      //打开文件
      if (message.command === "openBotFile") {
        vscode.commands.executeCommand("openBotFile", message.path);
      }
      if (message.command === "deleteBotFile") {
        vscode.commands.executeCommand("deleteBotFile", message.path);
      }
      //脚手架相关
      if (message.command === Msg.HAPPY_CLI_INIT) {
        await happyCliInit(message);
      }
      //脚手架环境检查
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
      //脚手架安装
      if (message.command === Msg.HAPPY_CLI_INSTALL_CLI) {
        installHappyCli();
      }
      //使用 create-happy-app 创建应用
      if (message.command === Msg.HAPPY_CLI_CREATE__APP) {
        createHappyApp();
      }
    });
  }

  // 发送生成代码数据给 webview
  postUpdateMessage(data) {
    if (this._webview) {
      this._webview.postMessage({
        type: "UPDATE",
        acceptedContentDetails: data,
      });
    }
  }
  // 发送当前项目的扫描数据
  postUpdateBotFiles(files) {
    if (this._webview) {
      this._webview.postMessage({
        type: "BOT_FILES",
        botFiles: files,
      });
    }
  }
}
function stopInlineLoop() {
  if (loopTimer) {
    clearTimeout(loopTimer);
    loopTimer = null;
  }
  if (reportViewProvider) {
    reportViewProvider.postGenerationStopped(); // 通知webview停止
  }
}
function deactivate() {
  isGenerating = false;
  stopInlineLoop();
  if (reportViewProvider) {
    reportViewProvider.postGenerationStopped(); // 通知webview停止
  }
}

module.exports = {
  activate,
  deactivate,
};
