import { useCall } from "./useCecClient";
import { type AxiosRequestConfig } from "axios";
export function useAxios() {
  const get = async (url: string, config?: AxiosRequestConfig) => {
    try {
      const response = (await useCall("Axios.get", url, config)) as {
        data: any;
      };
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  };
  const post = async (url: string, data?: any, config?: AxiosRequestConfig) => {
    try {
      const response = (await useCall("Axios.post", url, data, config)) as {
        data: any;
      };
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  };
  return { get, post };
}
