import "reflect-metadata";
import { registerControllers } from "cec-client-server/decorator";
import { GitController } from "./git.controller";
registerControllers([GitController]); // 只传一个参数，全局模式
