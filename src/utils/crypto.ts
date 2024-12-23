// 导入 CryptoJS 库用于加密解密操作
import CryptoJS from "crypto-js";

// 从环境变量中获取加密密钥
const secretKey = import.meta.env.VITE_SECRET_KEY;

// 验证密钥是否存在，如果不存在则抛出错误
if (!secretKey) {
  throw new Error("Encryption secret key is missing");
}

/**
 * 加密数据函数
 * @param data - 需要加密的数据（可以是任意类型）
 * @returns 返回加密后的字符串
 * @description
 * 1. 将输入数据转换为 JSON 字符串
 * 2. 使用 AES 加密算法和密钥对数据进行加密
 * 3. 返回加密后的字符串
 */
export const encryptData = (data: any): string => {
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, secretKey).toString();
};

/**
 * 解密数据函数
 * @param ciphertext - 加密后的字符串
 * @returns 返回解密后的原始数据
 * @description
 * 1. 使用 AES 解密算法和密钥对加密字符串进行解密
 * 2. 将解密后的字节数据转换为 UTF-8 字符串
 * 3. 将字符串解析回原始数据结构
 * @throws 如果解密失败或 JSON 解析失败会抛出错误
 */
export const decryptData = (ciphertext: string): any => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
  const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedData);
};
