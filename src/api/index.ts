import store from "@/store";
import { logout, updateToken } from "@/store/slice";
import axios, { AxiosError } from "axios";
import { message } from "antd";

export const useAxios = axios.create({
  baseURL: "",
});

export interface baseResponse<T> {
  code: number;
  msg: string;
  data: T;
}

export interface listDataType<T> {
  list: T[];
  total: number;
  page: number;
  page_size: number;
}

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
    const token = store.getState().web.user.userInfo?.token;
    if (!token) return config;
    config.headers["Authorization"] = `Bearer ${token}`;
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
    const token = response.headers["Authorization"];
    if (token) {
      const newToken = token.replace("Bearer ", "");
      store.dispatch(updateToken(newToken));
    }
    return response.data;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 401:
          store.dispatch(logout());
          message.warning("请重新登录");
          break;
        case 404:
          message.warning("请求的资源不存在");
          break;
        case 500:
          message.error("服务器错误，请稍后再试");
          break;
        default:
          message.error("网络错误，请检查网络连接");
      }
    } else if (error.request) {
      message.error("服务器无响应，请检查网络");
    } else {
      message.error("请求配置错误");
    }
    return Promise.reject(error);
  }
);
