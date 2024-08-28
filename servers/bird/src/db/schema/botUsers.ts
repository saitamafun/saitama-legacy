import { pgTable, text } from "drizzle-orm/pg-core";

export const botUsers = pgTable("botUsers", {
  id: text("id").unique().notNull().primaryKey(),
  username: text("username").unique("username", { nulls: "not distinct" }),
  chatId: text("chat_id").notNull(),
});
