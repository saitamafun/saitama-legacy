import bcrypt from "bcrypt";
import type { z } from "zod";
import { and, eq, sql, SQL } from "drizzle-orm";

import { Application } from "@/singleton";
import { generateKeypair } from "@/lib/utils";


import { apiKeys, apps } from "@/db/schema";
import type { insertApiKeySchema } from "@/db/zod";

export const createApiKey = async (
  userId: string,
  values: z.infer<typeof insertApiKeySchema>
) =>
  Application.instance.db.transaction(async (tx) => {
    const app = await tx.query.apps.findFirst({
      where: and(eq(apps.user, userId), eq(apps.id, values.app)),
    });

    if (app) {
      const { publicKey, secretKey } = await generateKeypair();

      const [apiKey] = await tx
        .insert(apiKeys)
        .values({
          ...values,
          publicKey,
          secretKey: await bcrypt.hash(secretKey, 10),
        })
        .onConflictDoUpdate({
          target: [apiKeys.app],
          set: {
            publicKey,
            secretKey: await bcrypt.hash(secretKey, 10),
          },
        })
        .returning();

      return { id: apiKey.id, publicKey, secretKey };
    }

    return null;
  });

export const getApiKeyByPublicKey = (publicKey: string) =>
  Application.instance.db.query.apiKeys
    .findFirst({
      where: eq(apiKeys.publicKey, publicKey),
      with: {
        app: {
          with: {
            user: true,
          },
          columns: {
            user: false,
          },
        },
      },
      columns: {
        id: false,
        secretKey: false,
        publicKey: false,
        app: false,
      },
    })
    .execute();

export const getApiKeysByUser = (
  userId: string,
  limit: number,
  offset: number,
  where?: SQL
) =>
  Application.instance.db.transaction(async (tx) => {
    const qApps = tx
      .select({ id: apps.id })
      .from(apps)
      .where(eq(apps.user, userId))
      .as("qApps");

    return tx
      .select({
        id: apiKeys.id,
        app: apiKeys.app,
        publicKey: apiKeys.publicKey,
      })
      .from(apiKeys)
      .where(where)
      .limit(limit)
      .offset(offset)
      .innerJoin(qApps, eq(qApps.id, apiKeys.app));
  });

export const getApiKeyByApp = (appId: string) =>
  Application.instance.db.query.apiKeys
    .findFirst({ where: eq(apiKeys.app, appId) })
    .execute();

export const deleteApiKeyByUserAndId = (userId: string, id: string) =>
  Application.instance.db.transaction((tx) => {
    const qApps = tx
      .$with("qApps")
      .as(tx.select().from(apps).where(eq(apps.user, userId)));

    return tx
      .with(qApps)
      .delete(apiKeys)
      .where(
        and(
          eq(
            apiKeys.app,
            sql`(select ${qApps.id} from ${qApps} where ${qApps.id}=${apiKeys.app} LIMIT 1)`
          ),
          eq(apiKeys.id, id)
        )
      )
      .returning()
      .execute();
  });
