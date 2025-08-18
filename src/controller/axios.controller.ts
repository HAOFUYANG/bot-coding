import type { AxiosRequestConfig } from "axios";
import { callable, controller } from "cec-client-server/decorator";
import { AxiosService } from "../service/axios.service";

@controller("Axios")
export class AxiosController {
  constructor() {}
  private axiosService = new AxiosService();

  @callable("get")
  get(url: string, config?: AxiosRequestConfig): Promise<any> {
    return this.axiosService.get(url, config);
  }

  @callable("post")
  post(url: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
    return this.axiosService.post(url, data, config);
  }

  @callable("put")
  put(url: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
    return this.axiosService.put(url, data, config);
  }

  @callable("delete")
  delete(url: string, config?: AxiosRequestConfig): Promise<any> {
    return this.axiosService.delete(url, config);
  }
  @callable("patch")
  patch(url: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
    return this.axiosService.patch(url, data, config);
  }
}
