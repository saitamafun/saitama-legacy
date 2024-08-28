import { pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { apps } from "./apps";

export const webhooks = pgTable(
  "webhooks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    url: text("url").notNull(),
    app: uuid("app")
      .references(() => apps.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (columns) => ({
    unique_webhooks: unique("unique_webhooks")
      .on(columns.app, columns.url)
      .nullsNotDistinct(),
  })
);
