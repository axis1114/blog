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

export function imageUpload(files: File[]): Promise<baseResponse<string>> {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("images", file);
  });

  return useAxios.post("/api/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
