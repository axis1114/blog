// 导入必要的依赖
import store from "@/store";
import { logout, updateToken } from "@/store/slice";
import { message } from "antd";
import axios, { AxiosError } from "axios";

// 创建axios实例，用于发起HTTP请求
export const useAxios = axios.create({
  baseURL: "", // API的基础URL，当前为空
});

// 定义基础响应数据接口
export interface baseResponse<T> {
  success: boolean; // 请求是否成功
  code: number; // 响应状态码
  message: string; // 响应信息
  data: T; // 响应数据，泛型类型
}

// 定义列表数据类型接口
export interface listDataType<T> {
  list: T[]; // 数据列表
  total: number; // 总数据量
  page: number; // 当前页码
  page_size: number; // 每页数据量
  total_page: number; // 总页数
  has_more: boolean; // 是否有更多数据
}

// 定义分页参数接口
export interface paramsType {
  page?: number; // 页码（可选）
  page_size?: number; // 每页数量（可选）
  key?: string; // 搜索关键字（可选）
}

/**
 * 请求拦截器
 * 在发送请求前自动添加token到请求头
 */
useAxios.interceptors.request.use(
  (config) => {
    // 从Redux store中获取token
    const token = store.getState().web.user.userInfo?.token;
    if (!token) return config;
    // 将token添加到请求头中
    config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 响应拦截器
 * 处理服务器响应数据和错误情况
 */
useAxios.interceptors.response.use(
  (response) => {
    // 检查响应头中是否有新的token
    const token = response.headers["Authorization"];
    if (token) {
      // 如果有新token，更新到Redux store中
      const newToken = token.replace("Bearer ", "");
      store.dispatch(updateToken(newToken));
    }
    return response.data;
  },
  (error: AxiosError) => {
    // 错误处理逻辑
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 401:
          message.warning("请重新登录");
          store.dispatch(logout()); // token失效，执行登出操作
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
      // 请求发送成功但没有收到响应
      message.error("服务器无响应，请检查网络");
    } else {
      // 请求配置出错
      message.error("请求配置错误");
    }
    return Promise.reject(error);
  }
);
