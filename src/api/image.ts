import { baseResponse, listDataType, paramsType, useAxios } from ".";

export interface imageType {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  path: string;
  hash: string;
  name: string;
  type: string;
  size: number;
}

export function imageList(
  params: paramsType
): Promise<baseResponse<listDataType<imageType>>> {
  return useAxios.get("/api/image", { params: { ...params } });
}

export function imageDelete(id: number): Promise<baseResponse<string>> {
  return useAxios.delete(`/api/image/${id}`);
}

export interface imageUploadType {
  files: {
    file_name: string;
    is_success: boolean;
    msg: string;
    size: number;
    hash: string;
  }[];
}

export function imageUpload(
  files: File[]
): Promise<baseResponse<imageUploadType>> {
  // 验证文件
  const validFiles: File[] = [];

  files.forEach((file) => {
    validFiles.push(file);
  });

  // 如果没有有效文件，直接返回错误
  if (validFiles.length === 0) {
    return Promise.reject(new Error("没有有效的图片文件"));
  }

  const formData = new FormData();
  validFiles.forEach((file) => {
    formData.append("images", file);
  });

  return useAxios.post("/api/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
