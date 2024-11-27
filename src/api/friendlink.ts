import { baseResponse, useAxios, paramsType, listDataType } from ".";

export interface friendlinkCreateType {
  name: string;
  link: string;
}

export function friendlinkCreate(
  req: friendlinkCreateType
): Promise<baseResponse<string>> {
  return useAxios.post("/api/friendlink", req);
}

export interface friendlinkType {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  name: string;
  link: string;
}

export function friendlinkList(
  params?: paramsType
): Promise<baseResponse<listDataType<friendlinkType>>> {
  return useAxios.get("/api/friendlink", { params: { ...params } });
}

export function friendlinkDelete(id: number): Promise<baseResponse<string>> {
  return useAxios.delete(`/api/friendlink/${id}`);
}
