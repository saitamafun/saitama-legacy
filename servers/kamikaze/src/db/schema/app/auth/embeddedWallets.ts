import bs58 from "bs58";
import { Keypair } from "@solana/web3.js";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { authUsers } from "./authUsers";
import { encrypt } from "@/lib/secret";

export const createWallet = () => {
  const keypair = Keypair.generate();
  return encrypt(bs58.encode(keypair.secretKey));
};

export const embeddedWallets = pgTable("embeddedWallets", {
  id: uuid("id").defaultRandom().primaryKey(),
  hash: text("hash").$defaultFn(createWallet).notNull(),
  user: uuid("user")
    .references(() => authUsers.uid, { onDelete: "cascade" })
    .notNull(),
});
