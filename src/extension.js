const vscode = require("vscode");
const path = require("path");

let isGenerating = false;
let targetEditor = null;
let outputChannel = null;
let loopTimer = null;
let hasInsertedTrigger = false;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function triggerAndAcceptInline() {
  if (!isGenerating || !targetEditor) return;

  try {
    if (!hasInsertedTrigger) {
      // 第一次插入触发词
      await targetEditor.edit((editBuilder) => {
        editBuilder.insert(targetEditor.selection.active, "const");
      });
      outputChannel.appendLine(
        "[triggerAndAcceptInline] 首次插入触发词 console"
      );
      hasInsertedTrigger = true;
    }
    // await vscode.commands.executeCommand("type", { text: "\t" });
    // 触发 inline suggestion
    await vscode.commands.executeCommand("editor.action.inlineSuggest.trigger");
    outputChannel.appendLine("[triggerAndAcceptInline] 触发 inline suggestion");
    await delay(2000);
    // 打印命令
    // const commands = await vscode.commands.getCommands(true);
    // const inline = commands.filter((cmd) =>
    //   cmd.startsWith("editor.action.inlineSuggest")
    // );
    // console.log(inline);
    // 接受下一个 inline suggestion
    // await vscode.commands.executeCommand("autoInlineGenerator.tab");
    await vscode.commands.executeCommand(
      "editor.action.inlineSuggest.acceptNextLine"
    );
    await delay(1100);

    // 打印当前行内容
    const lineText = targetEditor.document.lineAt(
      targetEditor.selection.active.line
    ).text;
    outputChannel.appendLine(
      `[triggerAndAcceptInline] 当前行内容: ${lineText}`
    );

    // 换行，准备下次 inline suggestion
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

      // 初始化
      isGenerating = true;
      hasInsertedTrigger = false;

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

  context.subscriptions.push(
    vscode.commands.registerCommand("autoInlineGenerator.tab", async () => {
      outputChannel.appendLine("=== 要开始tab了 ===");
      // await vscode.commands.executeCommand("acceptSelectedSuggestion");
      // vscode.commands.executeCommand("workbench.action.files.openFile");
      // await vscode.commands.executeCommand("type", { text: " " });
      // await delay(1000);
      await vscode.commands.executeCommand(
        "editor.action.inlineSuggest.acceptNextWord"
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
}

function deactivate() {
  isGenerating = false;
  stopInlineLoop();
}

module.exports = {
  activate,
  deactivate,
};
