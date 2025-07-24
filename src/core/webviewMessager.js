/**
 * @description 这是插件统一的消息中心，用于和外部比如panel进行消息发送
 */

//消息全部类型整合
let Msg = {
  //脚手架初始化
  HAPPY_CLI_INIT: "happyCli.init",
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

module.exports = {
  Msg,
  setWebview,
  postMessage,
};
