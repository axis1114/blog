import { baseResponse, listDataType, paramsType, useAxios } from ".";

export interface articleType {}

export function articleList(
  params: paramsType
): Promise<baseResponse<listDataType<articleType>>> {
  return useAxios.get("/api/article/list", { params: { ...params } });
}

export function articleDetail(id: string): Promise<baseResponse<articleType>> {
  return useAxios.get(`/api/article/${id}`);
}

export interface articleCreateType {
  title: string;
  abstract: string;
  category: string;
  content: string;
  cover_id: number;
}

export function articleCreate(
  data: articleCreateType
): Promise<baseResponse<string>> {
  return useAxios.post("/api/article", data);
}

export interface articleUpdateType {
  id: string;
  title: string;
  abstract: string;
  content: string;
  category: string;
  cover_id: number;
}

export function articleUpdate(
  data: articleUpdateType
): Promise<baseResponse<string>> {
  return useAxios.put("/api/article", data);
}

export function articleDelete(id: string): Promise<baseResponse<string>> {
  return useAxios.delete(`/api/article/${id}`);
}
