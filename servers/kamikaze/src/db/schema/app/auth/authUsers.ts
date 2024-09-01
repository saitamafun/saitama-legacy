import {
  boolean,
  json,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { auths } from "./auths";

type EmailVerification = {
  code: string;
  ttl: number;
};

export type VerificationData = EmailVerification;

export const authUsers = pgTable(
  "authUsers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    uid: text("uid").notNull(), // unique in 1st or 3rd party context
    email: text("email"),
    provider: text("provider").notNull(),
    auth: uuid("auth")
      .references(() => auths.id, { onDelete: "cascade" })
      .notNull(),
    isVerified: boolean("is_verified").default(false).notNull(),
    lastLogin: timestamp("last_login").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    verificationData: json("verification_data").$type<VerificationData>(),
  },
  (columns) => ({
    unique_id_auth: unique("unique_id_auth").on(columns.id, columns.auth),
    unique_uid_auth: unique("unique_uid_auth").on(columns.uid, columns.auth),
  })
);
