import "reflect-metadata";
import { registerControllers } from "cec-client-server/decorator";
import { GitController } from "./git.controller";
import { AxiosController } from "./axios.controller";
import { UserController } from "./user.controller";
registerControllers([GitController, AxiosController, UserController]);
