import { useUser } from "@/hooks/useUser";
const { getUser } = useUser();

export async function useSession() {
  try {
    const result = await getUser();
    if (result?.session) {
      return result.session;
    } else {
      throw new Error("session is null");
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
}
