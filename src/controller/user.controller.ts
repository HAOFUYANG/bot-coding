import { callable, controller } from "cec-client-server/decorator";
import { ContextService } from "@/service/context.service";
@controller("User")
export class UserController {
  constructor() {
    // 空的，不从 DI 取
  }

  @callable("saveUser")
  async saveUser(userInfo: any): Promise<{ success: boolean }> {
    await ContextService.setState("userInfo", JSON.stringify(userInfo));
    return { success: true };
  }
  @callable("getUser")
  async getUser(): Promise<any> {
    return ContextService.getState("userInfo");
  }
  @callable("clearUser")
  async clearUser(): Promise<{ success: boolean }> {
    await ContextService.setState("userInfo", null);
    return { success: true };
  }
}
