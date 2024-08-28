import { pgTable, text, uuid, timestamp, unique } from "drizzle-orm/pg-core";
import { apps } from "../apps";

export const wallets = pgTable(
  "wallets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    app: uuid("app")
      .references(() => apps.id)
      .notNull(),
    address: text("address").notNull(),
    chain: text("chain", { enum: ["ethereum", "solana"] }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (column) => ({
    addressAndNetwork: unique("address_and_network").on(
      column.app,
      column.address,
      column.chain
    ),
  })
);
