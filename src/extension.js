const vscode = require("vscode");
const path = require("path");

let isGenerating = false;
let targetEditor = null;
let outputChannel = null;
let loopTimer = null;
let hasInsertedTrigger = false;
let maxGeneratedLines = 1000;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * @description 触发内联建议并采纳。
 * @returns {Promise<void>}
 */
async function triggerAndAcceptInline() {
  if (!isGenerating || !targetEditor) return;
  try {
    if (!hasInsertedTrigger) {
      // 1.插入触发词------>第一次插入触发词
      await targetEditor.edit((editBuilder) => {
        editBuilder.insert(targetEditor.selection.active, "const");
      });
      outputChannel.appendLine("first trigger console success");
      hasInsertedTrigger = true;
    }
    // 2.触发---->inline suggestion
    await vscode.commands.executeCommand("editor.action.inlineSuggest.trigger");
    outputChannel.appendLine("trigger inline suggestion");
    await delay(2000);
    // 打印命令(帮助-打开开发者模式就可以看到console)
    // const commands = await vscode.commands.getCommands(true);
    // const inline = commands.filter((cmd) =>
    //   cmd.startsWith("editor.action.inlineSuggest")
    // );
    // console.log(inline);
    // 3.采纳----> inline suggest
    await vscode.commands.executeCommand("editor.action.inlineSuggest.commit");
    //4.保存---->执行一次save
    await targetEditor.document.save().then(() => {
      outputChannel.appendLine(
        "accept inline suggestion success and save once"
      );
    });
    // 5.光标移动然后换行----->准备下次 inline suggestion
    await moveCursorToEndAndInsertNewLine(targetEditor);
    // 6.空行检测----->如果存在空行，主动做一次触发内联推荐
    if (isLastLinesEmpty(targetEditor, 2)) {
      outputChannel.appendLine("insert words for empty line to ");
      await insertTriggerWord(targetEditor);
    }
    // await delay(1000);
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
 * @description 检查文件最后几行是否都是空行
 * @param {vscode.TextEditor} editor
 * @param {number} linesCount
 * @returns {boolean}
 */
function isLastLinesEmpty(editor, linesCount = 3) {
  const doc = editor.document;
  const totalLines = doc.lineCount;
  let emptyLines = 0;
  for (let i = totalLines - 1; i >= Math.max(0, totalLines - linesCount); i--) {
    const text = doc.lineAt(i).text.trim();
    if (text === "") {
      emptyLines++;
    }
  }
  return emptyLines === linesCount;
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
    editBuilder.insert(endPosition, "\nconst");
  });
}

function startInlineLoop(minDelay = 1000, maxDelay = 2000) {
  //
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
    vscode.commands.registerCommand("coding.start", async () => {
      if (isGenerating) {
        vscode.window.showInformationMessage("coding ...");
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
      const fileName = `bot-coder-${timestamp}.js`;
      const fileUri = vscode.Uri.file(path.join(folderUri[0].fsPath, fileName));
      await vscode.workspace.fs.writeFile(fileUri, Buffer.from("", "utf8"));
      targetEditor = await vscode.window.showTextDocument(fileUri);

      isGenerating = true;
      hasInsertedTrigger = false;
      outputChannel.appendLine(`ready to code in the ${fileName}...`);
      //设置最大输入行数
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
      maxGeneratedLines = inputMaxLines ? Number(inputMaxLines) : 1000;
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
}

function deactivate() {
  isGenerating = false;
  stopInlineLoop();
}

module.exports = {
  activate,
  deactivate,
};
