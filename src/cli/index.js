const vscode = require("vscode");
const { createTemplateByOptions } = require("./createTemplateByOptions");
const { downloadTemplate } = require("./downloadTemplate");
const { installTemplate } = require("./installTemplate");
const path = require("path");
const fs = require("fs");
const { delay } = require("../utils/delay");
export const happyCliInit = async (message) => {
  const { name, type, template } = message.params;
  try {
    //1.这对应了脚手架项目的第一步选择模版
    const folder = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "请选择项目模版文件生成位置",
    });
    if (!folder) return;
    //获取文件安装地址
    const baseDir = folder[0].fsPath;
    const selectedTemplate = await createTemplateByOptions({
      name,
      type,
      template,
    });
    //2.下载项目模版至缓存目录
    await downloadTemplate(selectedTemplate);
    //3.安装项目模版至项目目录
    await installTemplate(selectedTemplate, baseDir);
    //4.写入hook，目的是新的文件窗口可以通过hook检查确认是否安装有依赖
    const hookPath = path.join(baseDir, name, ".happy-hook.js");
    fs.writeFileSync(
      hookPath,
      `module.exports = {
          runInTerminal: [
            'echo 正在安装依赖...',
            'pnpm install'
          ] 
        };`.trim()
    );
    const projectPath = path.join(baseDir, name);
    //5.打开新的项目窗口，执行hook
    vscode.commands.executeCommand(
      "vscode.openFolder",
      vscode.Uri.file(projectPath),
      false
    );
    //6.打开项目之后会出现用户信任确认窗口，所有插件端暂时不做脚手架自动安装的能力
  } catch (error) {
    vscode.window.showErrorMessage(`创建失败：${e.message}`);
  }
};
