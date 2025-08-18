import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CreateAxiosDefaults,
  InternalAxiosRequestConfig,
} from "axios";

export class AxiosService {
  private axiosInstance: AxiosInstance;

  constructor(defaults: CreateAxiosDefaults = {}) {
    this.axiosInstance = axios.create(defaults);

    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => config,
      (error) => Promise.reject(error)
    );

    // 响应拦截器
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response) {
          const status = error.response.status;
          console.log("error.response :>> ", error.response);
          if (status === 401) {
            // 跳转登录页面
            console.log("需要做重新登陆了");
          }
        }
        return Promise.reject(error);
      }
    );
  }

  get<T = any, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.axiosInstance.get(url, config);
  }

  post<T = any, R = AxiosResponse<T>>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.axiosInstance.post(url, data, config);
  }

  put<T = any, R = AxiosResponse<T>>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.axiosInstance.put(url, data, config);
  }

  delete<T = any, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.axiosInstance.delete(url, config);
  }

  patch<T = any, R = AxiosResponse<T>>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.axiosInstance.patch(url, data, config);
  }
}
