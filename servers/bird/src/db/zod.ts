import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { botUsers } from "./schema";

export const insertBotUserSchema = createInsertSchema(botUsers);
export const selectBotUserSchema = createSelectSchema(botUsers);
