import type { z } from "zod";
import { eq } from "drizzle-orm";

import { Application } from "@/singleton";

import { users } from "@/db/schema";
import type { insertUserSchema } from "@/db/zod";

export const createUser = (values: z.infer<typeof insertUserSchema>) =>
  Application.instance.db.insert(users).values(values).returning().execute();

export const getUserById = (id: string) =>
  Application.instance.db.query.users
    .findFirst({
      where: eq(users.id, id),
    })
    .execute();

export const updateUserById = (
  id: string,
  values: Partial<z.infer<typeof insertUserSchema>>
) => Application.instance.db.update(users).set(values).where(eq(users.id, id));

export const deleteUserById = (id: string) =>
  Application.instance.db.delete(users).where(eq(users.id, id));
