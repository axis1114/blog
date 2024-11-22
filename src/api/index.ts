import axios from "axios";

export const useAxios = axios.create({
  baseURL: "",
});

export interface baseResponse<T> {}

export interface listDataType<T> {}

export interface paramsType {
  page?: number;
  page_size?: number;
  keyword?: string;
}

/**
 * 请求拦截器
 * 添加 token 到请求头
 */
useAxios.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 响应拦截器
 * 1. 处理 token 刷新
 * 2. 统一错误处理
 */
useAxios.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);
