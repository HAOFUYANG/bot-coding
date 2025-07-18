var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// src/utils/insertRandomSnippet.js
var require_insertRandomSnippet = __commonJS({
  "src/utils/insertRandomSnippet.js"(exports2, module2) {
    var vscode2 = require("vscode");
    var snippets = [
      "// TODO: optimize this function",
      "console.log('debug info');",
      "function helper(param) { return param * 2; }",
      "const data = fetch('/api/data');",
      "let total = 0;",
      "const sum = (a, b) => a + b;",
      "class TempClass {\n  constructor() {}\n}",
      "try {\n  // risky code\n} catch (e) {\n  console.error(e);\n}",
      "// FIXME: workaround for legacy browser",
      "import fs from 'fs';",
      "/* random filler */",
      "const timestamp = Date.now();",
      "if (!Array.isArray(items)) return;",
      "const config = { mode: 'dev' };",
      "const user = { name: 'guest', id: 0 };",
      "let counter = 1;",
      "while (counter < 10) counter++;",
      "setTimeout(() => console.log('done'), 1000);",
      "const regex = /[a-z]+/gi;",
      "const PI = Math.PI;",
      "for (let i = 0; i < 5; i++) console.log(i);",
      "function noop() {}",
      "const isValid = (x) => x != null;",
      "const uuid = crypto.randomUUID();",
      "async function fetchData() {\n  const res = await fetch('/api');\n}",
      "const result = await someAsyncCall();",
      "let cache = new Map();",
      "const arr = [1, 2, 3].map(x => x * 2);",
      "// HACK: skip step if missing props",
      "const env = process.env.NODE_ENV;",
      "function delay(ms) { return new Promise(r => setTimeout(r, ms)); }",
      "const version = '1.0.0';",
      "function logError(err) {\n  console.error('[ERR]', err);\n}",
      "document.querySelector('#app').innerHTML = 'Hello';",
      "const path = require('path');",
      "let flag = false;",
      "const clone = obj => JSON.parse(JSON.stringify(obj));",
      "module.exports = { start };",
      "import { readFileSync } from 'fs';",
      "const userAgent = navigator.userAgent;",
      "function once(fn) {\n  let called = false;\n  return (...args) => {\n    if (!called) {\n      called = true;\n      fn(...args);\n    }\n  };\n}",
      "const logger = msg => console.log(`[LOG] ${msg}`);",
      "const defaultValue = value ?? 'default';",
      "// DEBUG: temporary log",
      "window.addEventListener('load', () => console.log('loaded'));",
      "function getRandomInt(max) { return Math.floor(Math.random() * max); }",
      "const headers = new Headers({ 'Content-Type': 'application/json' });",
      "import axios from 'axios';",
      "function sumAll(...nums) {\n  return nums.reduce((a, b) => a + b, 0);\n}",
      "const set = new Set();",
      "function parseJSON(str) {\n  try { return JSON.parse(str); } catch { return null; }\n}",
      "const token = localStorage.getItem('token');",
      "export default function init() { console.log('init'); }",
      "// NOTE: deprecated method below",
      "Object.keys(obj).forEach(key => console.log(key));",
      "const noopAsync = async () => {};",
      "if (typeof window !== 'undefined') { console.log('browser'); }",
      "const status = isActive ? 'ON' : 'OFF';",
      "function debounce(fn, delay) {\n  let t;\n  return (...args) => {\n    clearTimeout(t);\n    t = setTimeout(() => fn(...args), delay);\n  };\n}",
      "let disconnected = false;",
      "fetch('/ping').then(r => r.text()).then(console.log);"
    ];
    async function insertRandomSnippet2(editor) {
      const random = snippets[Math.floor(Math.random() * snippets.length)];
      const lastLine = editor.document.lineCount - 1;
      const lastLineLength = editor.document.lineAt(lastLine).text.length;
      const position = new vscode2.Position(lastLine, lastLineLength);
      await editor.edit((editBuilder) => {
        editBuilder.insert(position, `
${random}`);
      });
    }
    module2.exports = {
      insertRandomSnippet: insertRandomSnippet2
    };
  }
});

// src/extension.js
var vscode = require("vscode");
var path = require("path");
var { insertRandomSnippet } = require_insertRandomSnippet();
var isGenerating = false;
var targetEditor = null;
var outputChannel = null;
var loopTimer = null;
var hasInsertedTrigger = false;
var maxGeneratedLines = 1e3;
var acceptRatio = 25;
var acceptedContentDetails = [];
var acceptedCount = 0;
var reportViewProvider = null;
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function triggerAndAcceptInline() {
  if (!isGenerating || !targetEditor) {
    return;
  }
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
      await targetEditor.edit((editBuilder) => {
        editBuilder.insert(targetEditor.selection.active, "const");
      });
      outputChannel.appendLine("first trigger success");
      hasInsertedTrigger = true;
    }
    const prevLineCount = targetEditor.document.lineCount;
    await vscode.commands.executeCommand("editor.action.inlineSuggest.trigger");
    outputChannel.appendLine("trigger inline suggestion");
    await delay(2e3);
    const currentLineCount = targetEditor.document.lineCount;
    const generatedRatio = acceptedCount / currentLineCount;
    const shouldAccept = Math.random() < acceptRatio / 100 - generatedRatio;
    let didAccept = false;
    if (shouldAccept) {
      await vscode.commands.executeCommand(
        "editor.action.inlineSuggest.commit"
      );
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
        content: addedContent.trim()
      });
      if (reportViewProvider) {
        reportViewProvider.postUpdateMessage(acceptedContentDetails);
      }
    }
    await moveCursorToEndAndInsertNewLine(targetEditor);
    if (shouldTriggerOnEmptyLines(targetEditor, 3, 2)) {
      outputChannel.appendLine("insert words for empty line to ");
      await insertTriggerWord(targetEditor);
    }
  } catch (e) {
    outputChannel.appendLine(`[triggerAndAcceptInline] error: ${e.message}`);
  }
}
async function moveCursorToEndAndInsertNewLine(editor) {
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
async function scanBotFilesAndUpdate(reportViewProvider2) {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders && workspaceFolders.length > 0) {
    const files = await vscode.workspace.findFiles("**/bot-coder-*.js");
    const result = files.map((fileUri) => ({
      name: path.basename(fileUri.fsPath),
      path: fileUri.fsPath
    }));
    reportViewProvider2?.postUpdateBotFiles(result);
  }
}
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
async function insertTriggerWord(editor) {
  const lastLine = editor.document.lineCount - 1;
  const lastLineLength = editor.document.lineAt(lastLine).text.length;
  const endPosition = new vscode.Position(lastLine, lastLineLength);
  await editor.edit((editBuilder) => {
    editBuilder.insert(endPosition, "\nconst getData =");
  });
}
function startInlineLoop(minDelay = 1e3, maxDelay = 2e3) {
  async function loop() {
    if (!isGenerating) return;
    await triggerAndAcceptInline();
    const delayMs = Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;
    loopTimer = setTimeout(loop, delayMs);
  }
  loop();
}
function activate(context) {
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
      console.log("args :>> ", args);
      acceptedContentDetails = [];
      acceptedCount = 0;
      if (reportViewProvider) {
        reportViewProvider.postUpdateMessage(acceptedContentDetails);
      }
      const folderUri = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "\u9009\u62E9\u751F\u6210\u6587\u4EF6\u5939"
      });
      if (!folderUri) {
        return;
      }
      const timestamp = (/* @__PURE__ */ new Date()).getTime();
      const fileName = `bot-coder-${timestamp}.js`;
      const fileUri = vscode.Uri.file(path.join(folderUri[0].fsPath, fileName));
      await vscode.workspace.fs.writeFile(fileUri, Buffer.from("", "utf8"));
      targetEditor = await vscode.window.showTextDocument(fileUri);
      isGenerating = true;
      hasInsertedTrigger = false;
      outputChannel.appendLine(`ready to code in the ${fileName}...`);
      let maxLines = args?.maxGeneratedLines;
      if (!maxLines) {
        const inputMaxLines = await vscode.window.showInputBox({
          prompt: "\u8BF7\u8F93\u5165\u8981\u751F\u6210\u7684\u6700\u5927\u884C\u6570\uFF08\u8D85\u8FC7\u540E\u81EA\u52A8\u505C\u6B62\uFF09",
          placeHolder: "\u9ED8\u8BA41000",
          validateInput: (value) => {
            if (value && isNaN(Number(value))) {
              return "\u8BF7\u8F93\u5165\u6570\u5B57";
            }
            return null;
          }
        });
        maxLines = inputMaxLines ? Number(inputMaxLines) : 1e3;
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
      outputChannel.appendLine("=== \u8981\u5F00\u59CBtab\u4E86 ===");
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
    vscode.commands.registerCommand("openBotFile", async (filePath) => {
      const uri = vscode.Uri.file(filePath);
      await vscode.window.showTextDocument(uri);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("deleteBotFile", async (filePath) => {
      const uri = vscode.Uri.file(filePath);
      await vscode.workspace.fs.delete(uri);
      vscode.window.showInformationMessage(`\u6587\u4EF6\u5DF2\u5220\u9664: ${filePath}`);
      await scanBotFilesAndUpdate(reportViewProvider);
    })
  );
}
var InlineReportViewProvider = class {
  constructor(context) {
    this._context = context;
    this._webviewView = null;
  }
  //停止事件
  postGenerationStopped() {
    if (this._webview) {
      this._webview.postMessage({
        type: "GENERATION_STOPPED"
      });
    }
  }
  //获取webviewView
  resolveWebviewView(webviewView) {
    this._webview = webviewView.webview;
    const webview = webviewView.webview;
    const mediaPath = vscode.Uri.file(
      path.join(this._context.extensionPath, "media")
    );
    webview.options = {
      enableScripts: true,
      localResourceRoots: [mediaPath]
    };
    const isDevMode = process.env.NODE_ENV === "development";
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
      });
    }
    webview.onDidReceiveMessage((message) => {
      console.log("message :>> ", message);
      if (message.command === "coding.start") {
        const { maxGeneratedLines: maxGeneratedLines2, acceptRatio: acceptRatio2 } = message.params;
        vscode.commands.executeCommand("coding.start", {
          maxGeneratedLines: maxGeneratedLines2,
          acceptRatio: acceptRatio2
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
    });
  }
  // 发送生成代码数据给 webview
  postUpdateMessage(data) {
    if (this._webview) {
      this._webview.postMessage({
        type: "UPDATE",
        acceptedContentDetails: data
      });
    }
  }
  // 发送当前项目的扫描数据
  postUpdateBotFiles(files) {
    if (this._webview) {
      this._webview.postMessage({
        type: "BOT_FILES",
        botFiles: files
      });
    }
  }
};
function stopInlineLoop() {
  if (loopTimer) {
    clearTimeout(loopTimer);
    loopTimer = null;
  }
  if (reportViewProvider) {
    reportViewProvider.postGenerationStopped();
  }
}
function deactivate() {
  isGenerating = false;
  stopInlineLoop();
  if (reportViewProvider) {
    reportViewProvider.postGenerationStopped();
  }
}
module.exports = {
  activate,
  deactivate
};
