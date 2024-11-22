import type { baseResponse } from ".";
import { useAxios } from ".";

export interface captchaType {
  captcha_id: string;
  pic_path: string;
}

export function GenCaptcha(): Promise<baseResponse<captchaType>> {
  return useAxios.get("/api/system/captcha");
}
