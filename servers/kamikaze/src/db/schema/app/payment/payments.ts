import crypto from "crypto";
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { wallets } from "./wallets";

const generatePaymentId = () => "PAY-" + crypto.randomBytes(8).toString("hex");

export const payments = pgTable("payments", {
  id: text("id").$defaultFn(generatePaymentId).primaryKey(),
  description: text("description"),
  amount: text("amount").notNull(),
  mint: text("mint"),
  signature: text("signature").unique(),
  customer: text("customer").notNull(),
  wallet: uuid("wallet").references(() => wallets.id, { onDelete: "set null" }),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
