import type { z } from "zod";

import { botUsers } from "@/db/schema";
import type { insertBotUserSchema } from "@/db/zod";

import { db } from "./singleton";

export const createOrGetBotUser = (
  values: z.infer<typeof insertBotUserSchema>
) => {
  return db
    .insert(botUsers)
    .values(values)
    .onConflictDoUpdate({ target: botUsers.id, set: values })
    .returning()
    .execute();
};
