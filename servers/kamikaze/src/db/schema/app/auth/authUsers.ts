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
    uid: uuid("uid").defaultRandom().primaryKey(),
    id: text("id").notNull(),
    email: text("email"),
    provider: text("provider").notNull(),
    auth: uuid("auth")
      .references(() => auths.id, { onDelete: "cascade" })
      .notNull(),
    verificationData: json("verification_data").$type<VerificationData>(),
    isVerified: boolean("is_verified").default(false).notNull(),
    lastLogin: timestamp("last_login").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (columns) => ({
    unique_id_auth: unique("unique_id_auth").on(columns.id, columns.auth),
  })
);
