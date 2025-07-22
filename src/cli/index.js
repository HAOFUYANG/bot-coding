const vscode = require("vscode");
const { createTemplateByOptions } = require("./createTemplateByOptions");
const { downloadTemplate } = require("./downloadTemplate");
const { installTemplate } = require("./installTemplate");
export const happyCliInit = async (message) => {
  const { name, type, template } = message.params;
  try {
    //1.这对应了脚手架项目的第一步选择模版
    const folder = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "请选择项目文件生成位置",
    });
    console.log("folder :>> ", folder);
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
    vscode.commands.executeCommand(
      "vscode.openFolder",
      vscode.Uri.file(`${baseDir}/${name}`),
      true
    );
  } catch (error) {
    vscode.window.showErrorMessage(`创建失败：${e.message}`);
  }
};
