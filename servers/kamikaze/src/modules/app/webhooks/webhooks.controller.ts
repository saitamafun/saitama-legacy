import type { z } from "zod";
import xior, { type XiorResponse } from "xior";
import { and, eq, getTableColumns, sql, SQL } from "drizzle-orm";

import { Application, db } from "@/singleton";

import { apps, webhooks } from "@/db/schema";
import type { insertWebhookSchema } from "@/db/zod";

import { getApiKeyByApp } from "../apiKeys/apiKeys.controller";

export const createWebhook = async (
  userId: string,
  values: z.infer<typeof insertWebhookSchema>
) => {
  const app = await Application.instance.db.query.apps
    .findFirst({
      where: and(eq(apps.user, userId), eq(apps.id, values.app)),
    })
    .execute();

  if (app)
    return Application.instance.db
      .insert(webhooks)
      .values(values)
      .returning()
      .execute();

  return null;
};

export const getWebhooksByUser = (
  userId: string,
  limit: number,
  offset: number,
  where?: SQL
) => {
  const qApps = Application.instance.db
    .$with("qapps")
    .as(
      Application.instance.db.select().from(apps).where(eq(apps.user, userId))
    );

  return Application.instance.db
    .with(qApps)
    .select(getTableColumns(webhooks))
    .from(webhooks)
    .where(where)
    .leftJoin(qApps, eq(qApps.id, webhooks.app))
    .limit(limit)
    .offset(offset)
    .execute();
};

/**
 *
 * @param {string} appId
 * - For internal use only
 */
export const getWebhooksByApp = (appId: string) =>
  db.select().from(webhooks).where(eq(webhooks.app, appId)).execute();

export const updateWebhookByUserAndId = (
  userId: string,
  id: string,
  values: Partial<z.infer<typeof insertWebhookSchema>>
) => {
  const qApps = Application.instance.db
    .$with("qApps")
    .as(
      Application.instance.db.select().from(apps).where(eq(apps.user, userId))
    );

  return Application.instance.db
    .with(qApps)
    .update(webhooks)
    .set(values)
    .where(
      and(
        eq(
          webhooks.app,
          sql`(select ${qApps.id} from ${qApps} where ${webhooks.app}=${qApps.id} LIMIT 1)`
        ),
        eq(webhooks.id, id)
      )
    )
    .returning()
    .execute();
};

export const deleteWebhookByUserAndId = (userId: string, id: string) => {
  const qApps = Application.instance.db
    .$with("qApps")
    .as(
      Application.instance.db.select().from(apps).where(eq(apps.user, userId))
    );

  return Application.instance.db
    .with(qApps)
    .delete(webhooks)
    .where(
      and(
        eq(
          webhooks.app,
          sql`(select ${qApps.id} from ${qApps} where ${webhooks.app}=${qApps.id} LIMIT 1)`
        ),
        eq(webhooks.id, id)
      )
    )
    .returning()
    .execute();
};

export const sendWebhookEvent = async <T, U extends string>(
  appId: string,
  event: U,
  data: T,
  secretKey?: string
) => {
  const webhooks = await getWebhooksByApp(appId);
  const apiKey = secretKey ?? (await getApiKeyByApp(appId))!.secretKey;
  const tasks: Promise<XiorResponse>[] = [];

  for (const webhook of webhooks) {
    console.info(`sending event ${event} to  ${webhook.url}`);

    tasks.push(
      xior.post(webhook.url, data, {
        headers: {
          Authorization: "Bearer " + apiKey,
        },
      })
    );
  }

  console.log(webhooks);

  /// Todo log webhook response and retry on error
  return Promise.allSettled(tasks).then(console.log).catch(console.log);
};
