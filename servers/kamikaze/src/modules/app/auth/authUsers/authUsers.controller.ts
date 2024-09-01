import type { z } from "zod";
import { and, eq, getTableColumns, SQL, sql } from "drizzle-orm";

import { Application } from "@/singleton";

import { as } from "@/db";
import type { insertAuthUserSchema } from "@/db/zod";
import {
  apps,
  auths,
  authUsers,
  embeddedWallets,
  type VerificationData,
} from "@/db/schema";

export const createOrReturnAuthUser = (
  userId: string,
  appId: string,
  values: z.infer<typeof insertAuthUserSchema>
) =>
  Application.instance.db.transaction(async (tx) => {
    const authList = await tx
      .select({ id: auths.id })
      .from(auths)
      .innerJoin(
        apps,
        and(eq(apps.id, auths.app), eq(apps.id, appId), eq(apps.user, userId))
      )
      .limit(1);

    if (authList.length > 0) {
      const [auth] = authList;
      const userExists = await tx.query.authUsers.findFirst({
        columns: { id: true },
        where: and(eq(authUsers.uid, values.uid), eq(authUsers.auth, auth.id)),
      });

      const [authUser] = await tx
        .insert(authUsers)
        .values({ ...values, auth: auth.id })
        .onConflictDoUpdate({
          target: [authUsers.auth, authUsers.uid],
          set: values,
        })
        .returning();

      if (!userExists)
        await tx
          .insert(embeddedWallets)
          .values({ user: authUser.id })
          .returning();

      return authUser;
    }

    return null;
  });

export const getAuthUsersByApp = (
  appId: string,
  limit: number,
  offset: number,
  where?: SQL
) =>
  Application.instance.db.transaction(async (tx) => {
    const qAuths = tx
      .select({ authId: as(auths.id, "authId"), appId: as(apps.id, "appId") })
      .from(auths)
      .innerJoin(apps, eq(apps.id, appId))
      .as("qAuths");

    return tx
      .select({
        ...getTableColumns(authUsers),
        app: qAuths.appId,
      })
      .from(authUsers)
      .limit(limit)
      .offset(offset)
      .where(where)
      .innerJoin(qAuths, eq(qAuths.authId, authUsers.auth));
  });

export const getAuthUserByAppAndId = (app: string, id: string) =>
  Application.instance.db.transaction(async (tx) => {
    const qAuths = tx
      .select({ id: as(auths.id, "authId"), appId: as(apps.id, "appId") })
      .from(auths)
      .innerJoin(apps, eq(apps.id, app))
      .as("qAuths");

    return tx
      .select({
        ...getTableColumns(authUsers),
        app: qAuths.appId,
      })
      .from(authUsers)
      .where(and(eq(authUsers.id, id)))
      .innerJoin(qAuths, eq(qAuths.id, authUsers.auth));
  });

export const getAuthUserById = async (id: string) => {
  const authUser = await Application.instance.db.query.authUsers
    .findFirst({
      where: and(eq(authUsers.id, id)),
      with: {
        auth: {
          with: {
            app: true,
          },
          columns: { app: false },
        },
      },
      columns: { auth: false },
    })
    .execute();
  if (authUser) return { ...authUser, app: authUser.auth.app };
};

export const updateAuthUserByAppAndId = (
  appId: string,
  id: string,
  values: Partial<z.infer<typeof insertAuthUserSchema>>
) =>
  Application.instance.db.transaction(async (tx) => {
    const qAuths = tx.$with("qAuths").as(
      tx
        .select({ id: as(auths.id, "authId"), appId: as(apps.id, "appId") })
        .from(auths)
        .innerJoin(apps, eq(apps.id, appId))
    );

    return tx
      .with(qAuths)
      .update(authUsers)
      .set(values)
      .where(
        and(
          eq(
            authUsers.auth,
            sql`(select ${qAuths.id} from ${qAuths} where ${qAuths.id}=${authUsers.auth} LIMIT 1)`
          ),
          eq(authUsers.id, id)
        )
      )
      .returning();
  });

export const deleteAuthUserByAppAndId = (appId: string, id: string) =>
  Application.instance.db.transaction(async (tx) => {
    const qAuths = tx.$with("qAuths").as(
      tx
        .select({ id: as(auths.id, "authId"), appId: as(apps.id, "appId") })
        .from(auths)
        .innerJoin(apps, eq(apps.id, appId))
    );

    return tx
      .with(qAuths)
      .delete(authUsers)
      .where(
        and(
          eq(
            authUsers.auth,
            sql`(select ${qAuths.id} from ${qAuths} where ${qAuths.id} = ${authUsers.auth} LIMIT 1)`
          ),
          eq(authUsers.id, id)
        )
      )
      .returning();
  });

export const getAuthUserByAppAndUId = (app: string, id: string) =>
  Application.instance.db.transaction(async (tx) => {
    const qAuths = tx
      .select({ id: as(auths.id, "authId"), app: as(apps.id, "appId") })
      .from(auths)
      .innerJoin(apps, eq(apps.id, app))
      .as("qAuths");

    return tx
      .select({
        ...getTableColumns(authUsers),
        app: qAuths.app,
      })
      .from(authUsers)
      .where(and(eq(authUsers.uid, id)))
      .innerJoin(qAuths, eq(qAuths.id, authUsers.auth));
  });

export const confirmVerificationDataByUId = async (
  appId: string,
  uid: string,
  verificationData: Partial<Omit<VerificationData, "ttl">>
) => {
  const [authUser] = await getAuthUserByAppAndUId(appId, uid);

  if (verificationData.code && authUser.provider === "email+otp") {
    if (
      authUser.verificationData?.code === verificationData.code &&
      authUser.verificationData.ttl >= Date.now()
    )
      return authUser;
  }

  return null;
};
