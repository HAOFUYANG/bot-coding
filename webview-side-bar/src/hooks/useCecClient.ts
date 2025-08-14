import {
  CecClient,
  type MsgObserver,
  type MsgReceiver,
  type MsgSender,
} from "cec-client-server";
import { getVscodeApi } from "@/utils/vscodeApi";

const vscodeApi = getVscodeApi();
const msgSender: MsgSender = vscodeApi.postMessage.bind(vscodeApi);
const msgReceiver: MsgReceiver = (handler) => {
  window.addEventListener("message", (event) => {
    handler(event.data);
  });
};
const cecClient = new CecClient(msgSender, msgReceiver);
export const useCall = <ReplyVal>(name: string, ...args: any[]) => {
  console.log("name", name);
  console.log("...args", ...args);
  return cecClient.call<ReplyVal>(name, ...args);
};
export const useSubscribe = (
  name: string,
  observer: MsgObserver,
  ...args: any[]
) => {
  return cecClient.subscrible(name, observer, ...args);
};
