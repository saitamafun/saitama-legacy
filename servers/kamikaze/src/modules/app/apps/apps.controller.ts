import type { z } from "zod";
import { and, eq, SQL } from "drizzle-orm";

import { Application } from "@/singleton";

import { apps, auths } from "@/db/schema";
import type { insertAppSchema } from "@/db/zod";

export const createApp = (values: z.infer<typeof insertAppSchema>) =>
  Application.instance.db.transaction(async (tx) => {
    const [app] = await tx.insert(apps).values(values).returning();
    const [auth] = await tx
      .insert(auths)
      .values({
        app: app.id,
        methods: ["email", "wallet"],
        socials: [],
        origins: [],
      })
      .returning();

    return { ...app, auth };
  });

export const getAppsByUser = (
  userId: string,
  limit: number,
  offset: number,
  where?: SQL
) =>
  Application.instance.db
    .select()
    .from(apps)
    .limit(limit)
    .offset(offset)
    .where(and(eq(apps.user, userId), where));

export const getAppByUserAndId = (userId: string, id: string) =>
  Application.instance.db.query.apps.findFirst({
    where: and(eq(apps.id, id), eq(apps.user, userId)),
    with: {
      wallets: true,
    },
  });

export const updateAppByUserAndId = (
  userId: string,
  id: string,
  values: Partial<z.infer<typeof insertAppSchema>>
) =>
  Application.instance.db
    .update(apps)
    .set(values)
    .where(and(eq(apps.user, userId), eq(apps.id, id)))
    .returning()
    .execute();

export const deleteAppByUserAndId = (userId: string, id: string) =>
  Application.instance.db
    .delete(apps)
    .where(and(eq(apps.user, userId), eq(apps.id, id)))
    .returning()
    .execute();
