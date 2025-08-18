import { useAxios } from "@/hooks/useAxios";

// curl -X POST http://localhost:3000/user/getSstList

const baseUrl = "http://localhost:3000";
export default class WorkspaceApi {
  static async getUserInfo() {
    const result = await useAxios().post(
      `${baseUrl}/user/getUserInfo`,
      {},
      {
        headers: {
          Cookie: `sessionTick=sdsdsdsdssdsdsdsdqw`,
        },
      }
    );
    return result;
  }
  static async getSstList(data: any, sessionTick: string) {
    const result = await useAxios().post(
      `${baseUrl}/user/getSstList`,
      {
        ...data,
      },
      {
        headers: {
          Cookie: `sessionTick=${sessionTick}`,
        },
      }
    );
    return result;
  }
}
