import { baseResponse, useAxios } from ".";

export interface loginType {
  account: string;
  password: string;
  captcha: string;
  captcha_id: string;
}

export function Login(req: loginType): Promise<baseResponse<string>> {
  return useAxios.post("/api/user/login", req);
}

export function Logout(): Promise<baseResponse<string>> {
  return useAxios.post("/api/user/logout");
}
