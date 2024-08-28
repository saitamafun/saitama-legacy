import { sql } from "drizzle-orm";
import { users } from "../users";
import { pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const apps = pgTable(
  "apps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user: uuid("user")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    logo: text("logo"),
    trustedOrigins: text("origins")
      .array()
      .default(sql`ARRAY[]::text[]`),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (column) => ({
    userAndName: unique().on(column.user, column.name),
  })
);
