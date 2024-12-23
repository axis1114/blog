import { baseResponse, listDataType, paramsType, useAxios } from ".";

// 图片数据类型接口定义
export interface imageType {
  id: number; // 图片ID
  created_at: string; // 创建时间
  updated_at: string; // 更新时间
  deleted_at: string; // 删除时间
  path: string; // 图片路径
  hash: string; // 图片哈希值
  name: string; // 图片名称
  type: string; // 图片类型
  size: number; // 图片大小（字节）
}

/**
 * 获取图片列表
 * @param params 分页参数
 * @returns Promise<图片列表数据>
 */
export function imageList(
  params: paramsType
): Promise<baseResponse<listDataType<imageType>>> {
  return useAxios.get("/api/image/list", { params: { ...params } });
}

/**
 * 删除指定图片
 * @param id 图片ID
 * @returns Promise<删除结果>
 */
export function imageDelete(id: number): Promise<baseResponse<string>> {
  return useAxios.delete(`/api/image/${id}`);
}

// 图片上传响应类型接口定义
export interface imageUploadType {
  files: {
    file_name: string; // 文件名
    is_success: boolean; // 上传是否成功
    msg: string; // 上传结果信息
    size: number; // 文件大小
    hash: string; // 文件哈希值
  }[];
}

/**
 * 上传图片文件
 * @param files 图片文件数组
 * @returns Promise<上传结果>
 */
export function imageUpload(
  files: File[]
): Promise<baseResponse<imageUploadType>> {
  // 验证文件
  const validFiles: File[] = [];

  // 遍历并收集有效文件
  files.forEach((file) => {
    validFiles.push(file);
  });

  // 如果没有有效文件，直接返回错误
  if (validFiles.length === 0) {
    return Promise.reject(new Error("没有有效的图片文件"));
  }

  // 构建FormData对象用于文件上传
  const formData = new FormData();
  validFiles.forEach((file) => {
    formData.append("images", file);
  });

  // 发送上传请求
  return useAxios.post("/api/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
