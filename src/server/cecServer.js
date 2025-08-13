import { CecServer } from "cec-client-server";
import { Webview } from "vscode";

export const createCecServer = (webview) => {
  const server = new CecServer({
    webview,
  });
  return server;
};
