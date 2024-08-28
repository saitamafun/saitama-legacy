import { relations } from "drizzle-orm";
import { users } from "./users";
import {
  apps,
  auths,
  authUsers,
  embeddedWallets,
  payments,
  wallets,
  apiKeys,
  webhooks,
} from "./app";

export const usersRelations = relations(users, ({ many }) => ({
  apps: many(apps),
}));

export const appsRelations = relations(apps, ({ one, many }) => ({
  user: one(users, { fields: [apps.user], references: [users.id] }),
  wallets: many(wallets),
  webhooks: many(webhooks),
  apiKey: one(apiKeys, { fields: [apps.id], references: [apiKeys.app] }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  app: one(apps, {
    fields: [apiKeys.app],
    references: [apps.id],
  }),
}));

export const webhooksRelations = relations(webhooks, ({ one }) => ({
  app: one(apps, {
    fields: [webhooks.app],
    references: [apps.id],
  }),
}));

export const walletsRelations = relations(wallets, ({ one }) => ({
  app: one(apps, {
    fields: [wallets.app],
    references: [apps.id],
  }),
}));

export const paymentRelations = relations(payments, ({ one }) => ({
  wallet: one(wallets, {
    fields: [payments.wallet],
    references: [wallets.id],
  }),
}));

export const authsRelations = relations(auths, ({ one }) => ({
  app: one(apps, {
    fields: [auths.app],
    references: [apps.id],
  }),
}));

export const authUsersRelations = relations(authUsers, ({ one, many }) => ({
  auth: one(auths, {
    fields: [authUsers.auth],
    references: [auths.id],
  }),
  wallet: many(embeddedWallets),
}));

export const embeddedWalletsRelations = relations(
  embeddedWallets,
  ({ one }) => ({
    user: one(authUsers, {
      fields: [embeddedWallets.user],
      references: [authUsers.uid],
    }),
  })
);
