import bcrypt from "bcrypt";
import crypto from "crypto";
import { SECRET_KEY } from "@/config";

const key = Buffer.from(SECRET_KEY, "hex").subarray(0, 16).toString("hex");

export const hashSalt = 16;

export const encrypt = <T>(data: T) => {
  const iv = crypto.randomBytes(8).toString("hex");
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(JSON.stringify(data), "utf-8", "base64");
  encrypted += cipher.final("base64");
  return Buffer.from([iv, encrypted].join("|")).toString("base64");
};

export const decrypt = <T>(value: string) => {
  value = Buffer.from(value, "base64").toString("utf-8");

  const [iv, hash] = value.split("|");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(hash, "base64", "utf-8");
  decrypted += decipher.final("utf-8");
  return JSON.parse(decrypted) as T;
};

export const hash = (value: string) =>
  bcrypt.hash(JSON.stringify(value), hashSalt);

export const verifyHash = (hash: string, plain: string) =>
  bcrypt.compare(hash, plain);
