import { useCall, useSubscribe } from "./useCecClient";

export function useGit() {
  const getRemotesWithPath = async () => {
    return await useCall("Git.getRemotesWithPath");
  };
  const commitAndPush = async (data: any) => {
    return await useCall("Git.commitAndPush", data);
  };
  const projectChange = (cb: (payload?: { cwd?: string }) => void) => {
    return useSubscribe("Git.projectChange", cb);
  };
  return { getRemotesWithPath, commitAndPush, projectChange };
}
