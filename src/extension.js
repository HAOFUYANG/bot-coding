const vscode = require("vscode");
const path = require("path");

let isGenerating = false;
let targetEditor = null;
let outputChannel = null;
let loopTimer = null;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function triggerAndAcceptInline() {
  if (!isGenerating || !targetEditor) return;

  try {
    // 插入触发词
    await targetEditor.edit((editBuilder) => {
      editBuilder.insert(targetEditor.selection.active, "conso");
    });
    outputChannel.appendLine("[triggerAndAcceptInline] 插入触发词 conso");

    await delay(300);

    // 触发内联补全
    await vscode.commands.executeCommand("editor.action.inlineSuggest.trigger");
    outputChannel.appendLine("[triggerAndAcceptInline] 触发 inline suggestion");

    await delay(500);

    // 获取命令列表
    const allCommands = await vscode.commands.getCommands(true);
    if (allCommands.includes("editor.action.inlineSuggest.accept")) {
      await vscode.commands.executeCommand(
        "editor.action.inlineSuggest.accept"
      );
      outputChannel.appendLine("[triggerAndAcceptInline] 使用 accept 命令采纳");
    } else {
      outputChannel.appendLine(
        "[triggerAndAcceptInline] 未找到 accept 命令，跳过"
      );
    }

    const lineText = targetEditor.document.lineAt(
      targetEditor.selection.active.line
    ).text;
    outputChannel.appendLine(
      `[triggerAndAcceptInline] 当前行内容: ${lineText}`
    );
    // 换行继续
    await targetEditor.edit((editBuilder) => {
      editBuilder.insert(targetEditor.selection.active, "\n");
    });
    await delay(100);
  } catch (e) {
    outputChannel.appendLine(`[triggerAndAcceptInline] 错误: ${e.message}`);
  }
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

function stopInlineLoop() {
  if (loopTimer) {
    clearTimeout(loopTimer);
    loopTimer = null;
  }
}

function activate(context) {
  outputChannel = vscode.window.createOutputChannel("InlineAutoGenerator");
  context.subscriptions.push(outputChannel);
  outputChannel.show(true);

  context.subscriptions.push(
    vscode.commands.registerCommand("autoInlineGenerator.start", async () => {
      if (isGenerating) {
        vscode.window.showInformationMessage("生成已在运行");
        return;
      }

      const folderUri = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "选择生成文件夹",
      });
      if (!folderUri) return;

      const timestamp = new Date().getTime();
      const fileName = `generated-inline-${timestamp}.js`;
      const fileUri = vscode.Uri.file(path.join(folderUri[0].fsPath, fileName));

      await vscode.workspace.fs.writeFile(fileUri, Buffer.from("", "utf8"));
      targetEditor = await vscode.window.showTextDocument(fileUri);

      isGenerating = true;
      outputChannel.appendLine(`=== 在文件 ${fileName} 中开始自动生成 ===`);

      startInlineLoop();

      vscode.window.showInformationMessage(`已在 ${fileName} 启动内联自动生成`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("autoInlineGenerator.stop", () => {
      if (!isGenerating) {
        vscode.window.showInformationMessage("未在运行");
        return;
      }
      isGenerating = false;
      targetEditor = null;
      stopInlineLoop();
      outputChannel.appendLine("=== 内联生成已停止 ===");
      vscode.window.showInformationMessage("内联生成已停止");
    })
  );
}

function deactivate() {
  isGenerating = false;
  stopInlineLoop();
}

module.exports = {
  activate,
  deactivate,
};
