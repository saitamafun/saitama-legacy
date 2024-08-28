import { z } from "zod";
import { selectAuthUserSchema } from "@/db/zod";

export const authUsersAuthenticationSchema = z.object({
  idToken: z.string(),
});

export const emailAuthenticationSchema = z.object({
  email: z.string().email(),
});

export const emailVerificationSchema = z
  .object({
    code: z.string().length(6),
  })
  .merge(emailAuthenticationSchema);

export const safeAuthUserSchema = selectAuthUserSchema.pick({
  id: true,
  email: true,
  isVerified: true,
  provider: true,
  lastLogin: true,
  createdAt: true,
});
