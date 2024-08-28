import { pgTable, text, unique, uuid } from "drizzle-orm/pg-core";

import { apps } from "./apps";

export const apiKeys = pgTable("apiKeys", {
  id: uuid("id").defaultRandom().primaryKey(),
  secretKey: text("secret_key").notNull(),
  publicKey: text("public_key").notNull(),
  app: uuid("app")
    .references(() => apps.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
});
