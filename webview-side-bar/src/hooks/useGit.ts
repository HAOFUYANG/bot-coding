import { useCall } from "./useCecClient";

export function useGit() {
  const getRemotesWithPath = async () => {
    return await useCall("Git.getRemotesWithPath");
  };
  const commitAndPush = async () => {
    return await useCall("Git.commitAndPush");
  };
  return { getRemotesWithPath, commitAndPush };
}
