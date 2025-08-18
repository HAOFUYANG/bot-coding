let vscodeApiInstance: any = null;
/**
 * @description 获取vscodeApi实例
 * @returns
 */
declare global {
  interface Window {
    acquireVsCodeApi: () => any;
  }
}
export function getVscodeApi() {
  //单例防止一个webview多个实例导致的插件报错
  if (!vscodeApiInstance) {
    vscodeApiInstance = window.acquireVsCodeApi
      ? window.acquireVsCodeApi()
      : {
          postMessage: (...args: any[]) => {},
          getState: () => null,
          setState: () => {},
        };
  }
  return vscodeApiInstance;
}
