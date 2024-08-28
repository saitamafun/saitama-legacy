import bs58 from "bs58";
import crypto from "crypto";

import { Keypair } from "@solana/web3.js";
import type { FastifyRequest } from "fastify";
import xior from "xior";

export const buildURLFromRequest = (req: FastifyRequest) =>
  new URL(req.protocol + "://" + req.hostname + req.originalUrl);

export function getCSRFToken(req: FastifyRequest) {
  return (
    /** @ts-expect-error */
    (req.body && req.body._csrf) ||
    req.headers["csrf-token"] ||
    req.headers["xsrf-token"] ||
    req.headers["x-csrf-token"] ||
    req.headers["x-xsrf-token"]
  );
}

export const checkedConcatQueryString = (url: URL, query: URLSearchParams) => {
  const href = url.href;
  return href.startsWith("?")
    ? url + query.toString()
    : url + "?" + query.toString();
};

export const generateKeypair = async () => {
  const keypair = Keypair.generate();

  return {
    publicKey: keypair.publicKey.toBase58(),
    secretKey: bs58.encode(keypair.secretKey),
  };
};

export const generateRandomInt = (length: number) =>
  crypto.randomInt(Math.pow(10, length - 1), Math.pow(10, length) - 1);

export const truncateString = (value: string) =>
  value.slice(0, 4) + "..." + value.slice(value.length - 2);

export const safeFetch = <T>(url: string, timeout: number = 1000) =>
  xior
    .get<T>(url, { timeout })
    .then(({ data }) => data)
    .catch(() => null);

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
