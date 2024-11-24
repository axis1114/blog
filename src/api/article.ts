import { baseResponse, listDataType, paramsType, useAxios } from ".";

export interface articleType {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  abstract: string;
  content: string;
  look_count: number;
  comment_count: number;
  digg_count: number;
  collects_count: number;
  user_id: number;
  user_name: string;
  category: string;
  cover_id: number;
  cover_url: string;
  version: number;
  status: string;
}

export interface articleParamsType extends paramsType {
  category?: string;
  sort_field?: string;
  sort_order?: string;
}

export function articleList(
  params: articleParamsType
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

export interface DeleteParams {
  id_list: string[];
}

export function articleDelete(
  data: DeleteParams
): Promise<baseResponse<string>> {
  return useAxios.post(`/api/article/delete`, data);
}
