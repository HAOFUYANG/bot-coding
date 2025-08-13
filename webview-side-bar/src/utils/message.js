const vscodeApi = window.acquireVsCodeApi
  ? window.acquireVsCodeApi()
  : {
      postMessage: (...args) => console.log("[发送postmessage]", ...args),
      getState: () => null,
      setState: () => {},
    };
export { vscodeApi };
