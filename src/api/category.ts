import { baseResponse, paramsType, useAxios, listDataType } from ".";

export interface categoryCreateType {
  name: string;
}

export function categoryCreate(
  data: categoryCreateType
): Promise<baseResponse<string>> {
  return useAxios.post("/api/category", data);
}

export interface categoryType {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  name: string;
}

export function categoryList(
  params: paramsType
): Promise<baseResponse<listDataType<categoryType>>> {
  return useAxios.get("/api/category/list", { params: { ...params } });
}

export function categoryDelete(id: number): Promise<baseResponse<string>> {
  return useAxios.delete(`/api/category/${id}`);
}
