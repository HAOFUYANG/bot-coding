import { useCall } from "./useCecClient";
export function useUser() {
  const saveUser = async (userInfo: any) => {
    return await useCall("User.saveUser", userInfo);
  };

  const getUser = async () => {
    const result = await useCall<any | null>("User.getUser");
    return JSON.parse(result);
  };

  const clearUser = async () => {
    return await useCall("User.clearUser");
  };

  return { saveUser, getUser, clearUser };
}
