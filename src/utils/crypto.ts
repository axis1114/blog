import CryptoJS from "crypto-js";

const secretKey = import.meta.env.VITE_SECRET_KEY;

if (!secretKey) {
  throw new Error("Encryption secret key is missing");
}

export const encryptData = (data: any): string => {
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, secretKey).toString();
};

export const decryptData = (ciphertext: string): any => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
  const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedData);
};
