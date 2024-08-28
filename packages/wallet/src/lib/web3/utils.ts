import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  NATIVE_MINT,
  NATIVE_MINT_2022,
} from "@solana/spl-token";
import type { PostEvent } from "./types";

export const truncateAddress = (address: string) =>
  address.slice(0, 6) + "..." + address.slice(address.length - 4);

export const isTokenAccount = (owner: PublicKey) =>
  TOKEN_PROGRAM_ID.equals(owner) || TOKEN_2022_PROGRAM_ID.equals(owner);

export const isPublicKey = (value: any) => {
  try {
    if (value) {
      new PublicKey(value);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export const isNative = (value: string) => {
  const key = new PublicKey(value);
  return (
    SystemProgram.programId.equals(key) ||
    NATIVE_MINT.equals(key) ||
    NATIVE_MINT_2022.equals(key)
  );
};

export const SafeJson = {
  stringify: <T extends object>(value: T, indentation?: number) =>
    JSON.stringify(
      value,
      (_, value) => {
        if (typeof value === "bigint") return value.toString();
        return value;
      },
      indentation
    ),
};

export const sendMessage = (
  event: PostEvent.Event["event"],
  data: PostEvent.Event["data"],
  id?: string
) => {
  return window.parent.postMessage({ id, event, data }, "*");
};

export type Provider =
  | "telegram"
  | "google"
  | "github"
  | "apple"
  | "discord"
  | "email"
  | (string & {});

export type SaitamaURLParams = {
  accessToken: string;
  rpcEndpoint: string;
  endpoint?: string;
  customLoginMethods?: {
    logo: string;
    provider: Provider;
  }[];
};

export function decodeParams(hash?: string): SaitamaURLParams {
  return hash
    ? JSON.parse(Buffer.from(hash, "base64").toString("utf-8"))
    : Object.create(null);
}

export function encodeParams(params: SaitamaURLParams) {
  return Buffer.from(JSON.stringify(params), "utf-8").toString("base64");
}
