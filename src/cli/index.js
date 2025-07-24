const vscode = require("vscode");
const { createTemplateByOptions } = require("./createTemplateByOptions");
const { downloadTemplate } = require("./downloadTemplate");
const { installTemplate } = require("./installTemplate");
const { postMessage, Msg } = require("../core/webviewMessager");
const path = require("path");
const fs = require("fs");
const { delay } = require("../utils/delay");

const processStep = {
  STEP1: {
    current: 1,
    stepDetails: [
      {
        title: "In Progress",
        description: "准备创建项目模版...",
      },
      {
        title: "Waiting",
        description: "项目模版下载成功",
      },
      {
        title: "Waiting",
        description: "拷贝模版并开始渲染...",
      },
      {
        title: "Waiting",
        description: "模版项目创建成功",
      },
    ],
  },
  STEP2: {
    current: 2,
    stepDetails: [
      {
        title: "Finished",
        description: "准备创建项目模版...",
      },
      {
        title: "In Progress",
        description: "项目模版下载成功",
      },
      {
        title: "Waiting",
        description: "拷贝模版并开始渲染...",
      },
      {
        title: "Waiting",
        description: "模版项目创建成功",
      },
    ],
  },
  STEP3: {
    current: 3,
    stepDetails: [
      {
        title: "Finished",
        description: "准备创建项目模版...",
      },
      {
        title: "Finished",
        description: "项目模版下载成功",
      },
      {
        title: "In Progress",
        description: "拷贝模版并开始渲染...",
      },
      {
        title: "Waiting",
        description: "模版项目创建成功",
      },
    ],
  },
  STEP4: {
    current: 4,
    stepDetails: [
      {
        title: "Finished",
        description: "准备创建项目模版...",
      },
      {
        title: "Finished",
        description: "项目模版下载成功",
      },
      {
        title: "Finished",
        description: "拷贝模版并开始渲染...",
      },
      {
        title: "Finished",
        description: "模版项目创建成功",
      },
    ],
  },
};
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
    //1.创建项目模版
    postMessage({
      type: Msg.HAPPY_CLI_INIT,
      payload: processStep.STEP1,
    });
    await installTemplate(selectedTemplate, baseDir);
    //2.下载项目模版至缓存目录
    postMessage({
      type: Msg.HAPPY_CLI_INIT,
      payload: processStep.STEP2,
    });
    await downloadTemplate(selectedTemplate);
    //3.安装项目模版至项目目录
    postMessage({
      type: Msg.HAPPY_CLI_INIT,
      payload: processStep.STEP3,
    });
    await installTemplate(selectedTemplate, baseDir);
    postMessage({
      type: Msg.HAPPY_CLI_INIT,
      payload: processStep.STEP4,
    });
    const projectPath = path.join(baseDir, name);
    //5.打开新的项目窗口，执行hook
    vscode.commands.executeCommand(
      "vscode.openFolder",
      vscode.Uri.file(projectPath),
      true
    );
    //6.打开项目之后会出现用户信任确认窗口，所有插件端暂时不做脚手架自动安装的能力
  } catch (error) {
    vscode.window.showErrorMessage(`创建失败：${e.message}`);
  }
};
