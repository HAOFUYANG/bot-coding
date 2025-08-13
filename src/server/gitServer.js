import { gitActionsInit, commitAndPush } from "./core/git";
import { Msg } from "./core/Messager";
export const registerGitServer = (server) => {
  // git
  server.register(Msg.GIT_ACTIONS_GET_REMOTES_WITH_PATH, async (args) => {
    return await gitActionsInit();
  });
  // 提交并推送
  server.register(Msg.GIT_ACTIONS_COMMIT_AND_PUSH, async (args) => {
    console.log("args", args);
    return await commitAndPush(args.message);
  });
};
