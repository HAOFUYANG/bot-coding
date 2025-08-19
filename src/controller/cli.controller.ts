import {
  callable,
  controller,
  subscribable,
} from "cec-client-server/decorator";

/**
 * Git控制器类，用于处理Git相关的操作
 * 提供获取远程仓库信息和提交推送代码的功能
 */
@controller("Cli")
export class CliController {
  private _progressEmitter: ((data: any) => void) | null = null;

  constructor() {}

  @subscribable("initProgress")
  initProgress(next: any) {
    // 这里 next 就是推送消息的方法
    this._progressEmitter = next;

    // 返回取消订阅的回调
    return () => {
      this._progressEmitter = null;
    };
  }
  // 插件业务逻辑中调用它推送进度
  emitProgress(data: any) {
    if (this._progressEmitter) {
      this._progressEmitter(data);
    }
  }
  @callable("init")
  async init(data: {
    name: string;
    type: string;
    template: any;
  }): Promise<any> {}

  @callable("checkEnvironment")
  async checkEnvironment(): Promise<any> {
    return new Promise((resolve, reject) => {});
  }
  @callable("installHappyCli")
  async installHappyCli(): Promise<any> {
    return new Promise((resolve, reject) => {});
  }
  @callable("createHappyApp")
  async createHappyApp(): Promise<any> {
    return new Promise((resolve, reject) => {});
  }
}
