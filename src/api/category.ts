import { baseResponse, useAxios } from ".";

export interface categoryCreateType {
  name: string;
}

export function categoryCreate(
  req: categoryCreateType
): Promise<baseResponse<string>> {
  return useAxios.post("/api/category", req);
}

export interface categoryType {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  name: string;
}

export function categoryList(): Promise<baseResponse<categoryType[]>> {
  return useAxios.get("/api/category");
}

export function categoryDelete(id: number): Promise<baseResponse<string>> {
  return useAxios.delete(`/api/category/${id}`);
}
