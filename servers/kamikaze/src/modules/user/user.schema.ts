import { selectUserSchema } from "@/db/zod";

export const cleanUserSchema = selectUserSchema.omit({
  password: true,
});
