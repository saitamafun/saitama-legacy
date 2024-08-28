import bs58 from "bs58";
import type { z } from "zod";
import { and, eq } from "drizzle-orm";
import { Keypair, sendAndConfirmTransaction } from "@solana/web3.js";

import { Application } from "@/singleton";
import { embeddedWallets } from "@/db/schema";
import type {
  insertEmbededWalletSchema,
  selectEmbededWalletSchema,
} from "@/db/zod";
import { decrypt } from "@/lib/secret";

export const createEmbeddedWallet = (
  values: z.infer<typeof insertEmbededWalletSchema>
) =>
  Application.instance.db
    .insert(embeddedWallets)
    .values(values)
    .returning()
    .execute();

export const getEmbeddedWalletsByUser = (userId: string) =>
  Application.instance.db.query.embeddedWallets
    .findMany({
      where: eq(embeddedWallets.user, userId),
    })
    .execute();

export const getEmbeddedWalletByUserAndId = (userId: string, id: string) =>
  Application.instance.db.query.embeddedWallets
    .findFirst({
      where: and(eq(embeddedWallets.user, userId), eq(embeddedWallets.id, id)),
    })
    .execute();

export class Wallet {
  private readonly wallet: Keypair;

  constructor(
    private readonly params: z.infer<typeof selectEmbededWalletSchema>
  ) {
    const secretKey = decrypt<string>(params.hash);
    this.wallet = Keypair.fromSecretKey(bs58.decode(secretKey));
  }

  cleanData() {
    return {
      id: this.params.id,
      publicKey: this.wallet.publicKey.toBase58(),
    };
  }

  sendAndConfirmTransaction(
    ...[connection, transaction, signers, options]: Parameters<
      typeof sendAndConfirmTransaction
    >
  ) {
    return sendAndConfirmTransaction(
      connection,
      transaction,
      [this.wallet, ...signers],
      options
    );
  }

  get publicKey() {
    return this.wallet.publicKey;
  }
}
