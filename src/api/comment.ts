import { baseResponse, paramsType, useAxios } from ".";
import { userInfoType } from "./user";

export interface commentType {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  sub_comments: commentType[];
  parent_comment_id: number;
  content: string;
  digg_count: number;
  comment_count: number;
  article_id: number;
  user_id: number;
  user: userInfoType;
}

export interface commentListParamsType extends paramsType {
  article_id: string;
  sort_by?: string;
}

export function commentList(
  params: commentListParamsType
): Promise<baseResponse<commentType[]>> {
  return useAxios.get("/api/comment/list", { params: { ...params } });
}

export interface commentCreateType {
  content: string;
  article_id: string;
  parent_comment_id?: number;
}

export function commentCreate(
  data: commentCreateType
): Promise<baseResponse<string>> {
  return useAxios.post("/api/comment", data);
}

export function commentDelete(id: number): Promise<baseResponse<string>> {
  return useAxios.delete(`/api/comment/${id}`);
}
