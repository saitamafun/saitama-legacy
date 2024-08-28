import { string, z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import {
  apiKeys,
  apps,
  auths,
  authUsers,
  embeddedWallets,
  payments,
  users,
  wallets,
  webhooks,
} from "./schema";

export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email.email(),
}).omit({ id: true, lastLogin: true, isVerified: true });
export const selectUserSchema = createSelectSchema(users);
export const selectUserByIdSchema = selectUserSchema.pick({ id: true });

export const insertAppSchema = createInsertSchema(apps, {
  logo: (column) => column.logo.url(),
}).omit({ createdAt: true, id: true });
export const selectAppSchema = createSelectSchema(apps);
export const selectAppByIdSchema = selectAppSchema.pick({ id: true });

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  publicKey: true,
  secretKey: true,
});
export const selectApiKeySchema = createSelectSchema(apiKeys);
export const selectApiKeyByIdSchema = selectApiKeySchema.pick({ id: true });

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
});
export const selectWalletSchema = createSelectSchema(wallets);
export const selectWalletByIdSchema = selectWalletSchema.pick({ id: true });

export const insertWebhookSchema = createInsertSchema(webhooks, {
  url: (column) => column.url.url(),
}).omit({ id: true, createdAt: true });
export const selectWebhookSchema = createSelectSchema(webhooks);
export const selectWebhookById = selectWebhookSchema.pick({ id: true });

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});
export const selectPaymentSchema = createSelectSchema(payments);
export const selectPaymentById = selectPaymentSchema.pick({ id: true });

export const selectAuthSchema = createSelectSchema(auths);
export const insertAuthSchema = createInsertSchema(auths);

export const selectAuthUserSchema = createSelectSchema(authUsers);
export const selectAuthUserById = selectAuthUserSchema
  .pick({ id: true })
  .or(z.object({ id: string().default("me") }));
export const insertAuthUserSchema = createInsertSchema(authUsers, {
  email: (column) => column.email.email(),
  verificationData: () => z.object({ code: z.string(), ttl: z.number() }),
}).omit({
  id: true,
  auth: true,
  isVerified: true,
  createdAt: true,
});

export const selectEmbededWalletSchema = createSelectSchema(embeddedWallets);
export const selectEmbededWalletByIdSchema = selectEmbededWalletSchema.pick({
  id: true,
});
export const insertEmbededWalletSchema = createInsertSchema(
  embeddedWallets
).omit({ id: true });
