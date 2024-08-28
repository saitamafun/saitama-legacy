import type { z } from "zod";
import { and, eq, getTableColumns, SQL, sql } from "drizzle-orm";

import { Application } from "@/singleton";

import { apps, wallets } from "@/db/schema";
import type { insertWalletSchema } from "@/db/zod";

export const createWallet = async (
  userId: string,
  values: z.infer<typeof insertWalletSchema>
) => {
  const app = await Application.instance.db.query.apps.findFirst({
    where: eq(apps.user, userId),
  });

  if (app)
    return Application.instance.db
      .insert(wallets)
      .values(values)
      .returning()
      .execute();

  return null;
};

export const getWalletsByUser = (
  userId: string,
  limit: number,
  offset: number,
  where?: SQL
) =>
  Application.instance.db
    .select(getTableColumns(wallets))
    .from(wallets)
    .where(where)
    .innerJoin(apps, and(eq(apps.id, wallets.app), eq(apps.user, userId)))
    .limit(limit)
    .offset(offset);

/**
 *
 * - For internal use only
 */
export const getWalletBy = () => Application.instance.db.select().from(wallets);

export const updateWalletByUserAndId = (
  userId: string,
  id: string,
  values: Partial<z.infer<typeof insertWalletSchema>>
) => {
  const qApps = Application.instance.db
    .$with("qApps")
    .as(
      Application.instance.db.select().from(apps).where(eq(apps.user, userId))
    );

  return Application.instance.db
    .with(qApps)
    .update(wallets)
    .set(values)
    .where(
      and(
        eq(
          wallets.app,
          sql`(select ${qApps.id} from ${qApps} where ${qApps.id}=${wallets.app} LIMIT 1)`
        ),
        eq(wallets.id, id)
      )
    )
    .returning()
    .execute();
};

export const deleteWalletByUserAndId = (userId: string, id: string) => {
  const qApps = Application.instance.db
    .$with("qApps")
    .as(
      Application.instance.db.select().from(apps).where(eq(apps.user, userId))
    );

  return Application.instance.db
    .with(qApps)
    .delete(wallets)
    .where(
      and(
        eq(
          wallets.app,
          sql`(select ${qApps.id} from ${qApps} where ${qApps.id}=${wallets.app} LIMIT 1)`
        ),
        eq(wallets.id, id)
      )
    )
    .returning()
    .execute();
};
