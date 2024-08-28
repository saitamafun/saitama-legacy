import { insertUserSchema } from "@/db/zod";

export const authBodySchema = insertUserSchema.pick({
  email: true,
  password: true,
});
