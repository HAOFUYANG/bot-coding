/**
 * @description 这是插件统一的消息中心，用于和外部比如panel进行消息发送
 */

//消息全部类型整合
let Msg = {
  //脚手架初始化
  HAPPY_CLI_INIT: "happyCli.init",
  //检查node环境和脚手架是否安装
  HAPPY_CLI_CHECK_ENVIRONMENT: "happyCli.checkEnvironment",
  //安装脚手架
  HAPPY_CLI_INSTALL_CLI: "happyCli.installHappyCli",
  //使用create-happy-app方式创建应用
  HAPPY_CLI_CREATE__APP: "happyCli.createHappyApp",
  //Git相关
  GIT_ACTIONS_GET_REMOTES_WITH_PATH: "gitActions.getRemotesWithPath",
  GIT_ACTIONS_COMMIT_AND_PUSH: "gitActions.commitAndPush",
};
let webview = null;

function setWebview(view) {
  webview = view;
}
function postMessage(message) {
  if (webview) {
    webview.postMessage(message);
  } else {
    console.warn("Webview not initialized, message not sent:", message);
  }
}

export { Msg, setWebview, postMessage };
