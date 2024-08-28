import bs58 from "bs58";
import type { z } from "zod";
import { Connection, Keypair, Message, Transaction } from "@solana/web3.js";

import passport from "@fastify/passport";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { requestErrorHandler } from "@/lib/errorHandler";
import { selectEmbededWalletByIdSchema } from "@/db/zod";

import {
  secureSelectEmbeddedWallet,
  signTransactionSchema,
} from "./embededWallet.schema";
import {
  Wallet,
  getEmbeddedWalletByUserAndId,
  getEmbeddedWalletsByUser,
} from "./embededWallets.controller";

const getEmbeddedWalletsRoute = async (req: FastifyRequest) => {
  const wallets = await getEmbeddedWalletsByUser(req.user!.uid);

  return wallets
    .map((wallet) => new Wallet(wallet))
    .map((wallet) => secureSelectEmbeddedWallet.parse(wallet.cleanData()));
};

const sendTransactionRoute = (
  req: FastifyRequest<{
    Body: z.infer<typeof signTransactionSchema>;
    Params: z.infer<typeof selectEmbededWalletByIdSchema>;
  }>,
  reply: FastifyReply
) =>
  selectEmbededWalletByIdSchema
    .parseAsync(req.params)
    .then(({ id }) =>
      signTransactionSchema
        .parseAsync(req.body)
        .then(async ({ rpcEndpoint, ...body }) => {
          const connection = new Connection(rpcEndpoint);
          const embeddedWallet = await getEmbeddedWalletByUserAndId(
            req.user!.uid,
            id
          );

          if (embeddedWallet) {
            const wallet = new Wallet(embeddedWallet);
            const message = Message.from(body.transaction);
            const transaction = Transaction.populate(message);
            const keypairs = body.signers.map((signer) =>
              Keypair.fromSecretKey(bs58.decode(signer))
            );

            return wallet.sendAndConfirmTransaction(
              connection,
              transaction,
              keypairs
            );
          }
        })
    )
    .catch(requestErrorHandler(reply));

export const registerEmbeddedWalletRoute = (app: FastifyInstance) => {
  app
    .route({
      method: "GET",
      url: "/apps/auth/wallets/",
      preHandler: passport.authenticate("app/jwt"),
      handler: getEmbeddedWalletsRoute,
    })
    .route({
      method: "POST",
      url: "/apps/auth/wallets/:id/sendTransaction/",
      preHandler: passport.authenticate("app/jwt"),
      handler: sendTransactionRoute,
    });
};
