import { z } from "zod";
import {
  selectEmbededWalletByIdSchema,
  selectEmbededWalletSchema,
} from "@/db/zod";

export const getEmbeddedWalletByIdSchema = selectEmbededWalletByIdSchema.or(
  z.object({
    id: z.string().default("me"),
  })
);

export const secureSelectEmbeddedWallet = selectEmbededWalletSchema
  .omit({
    hash: true,
    user: true,
  })
  .merge(
    z.object({
      publicKey: z.string(),
    })
  );

export const signTransactionSchema = z.object({
  rpcEndpoint: z.string(),
  transaction: z.array(z.number()),
  signers: z.array(z.string()),
});

export const mintSchema = z.object({
  mints: z.array(z.string()),
});
