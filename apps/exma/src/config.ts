import { object, string, type InferType } from "yup";
import { decodeParams } from "@saitamafun/wallet";

const configSchema = object().shape({
  endpoint: string().url().notRequired(),
  rpcEndpoint: string().url().required(),
  accessToken: string().required(),
});

export const SAITAMA_API_URL =
  process.env.SAITAMA_API_URL ?? process.env.NEXT_PUBLIC_SAITAMA_API_URL;

export const DEBUG =
  "IS_PULL_REQUEST" in process.env && process.env.IS_PULL_REQUEST === "true";

export const getConfig = (hash: string) => {
  const query = decodeParams(hash);

  return Object.assign(query, {
    endpoint: query.endpoint ?? SAITAMA_API_URL,
  }) as InferType<typeof configSchema>;
};

export const isConfigValid = (query: InferType<typeof configSchema>) => {
  return configSchema.isValidSync(query);
};
