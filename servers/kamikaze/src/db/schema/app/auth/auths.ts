import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { apps } from "../apps";

export const auths = pgTable("auths", {
  id: uuid("id").defaultRandom().primaryKey(),
  app: uuid("app")
    .references(() => apps.id, { onDelete: "cascade" })
    .notNull(),
  methods: text("methods").array().notNull(),
  socials: text("socials").array().notNull(),
  origins: text("origins").array().notNull(),
});
