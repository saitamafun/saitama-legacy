import type { z } from "zod";
import { and, eq, getTableColumns, SQL, sql } from "drizzle-orm";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

import { Application, db } from "@/singleton";
import { apps, payments, wallets } from "@/db/schema";
import { parseTransactionTransfers } from "@/lib/web3";
import type {
  insertPaymentSchema,
  selectPaymentSchema,
  selectWalletSchema,
} from "@/db/zod";

import type {
  initializePaymentSchema,
  secureUpdateSchema,
} from "./payments.schema";

export const createPayment = async (
  userId: string,
  values: z.infer<typeof initializePaymentSchema>
) => {
  const app = await Application.instance.db.query.apps.findFirst({
    where: eq(apps.user, userId),
  });

  if (app)
    return Application.instance.db
      .insert(payments)
      .values(values)
      .returning()
      .execute();

  return null;
};

export const getPaymentByUserAndId = (userId: string, id: string) =>
  Application.instance.db
    .select(getTableColumns(payments))
    .from(payments)
    .where(eq(payments.id, id))
    .innerJoin(apps, eq(apps.user, userId))
    .execute();

const updatePaymentById = (
  id: string,
  values: Partial<z.infer<typeof insertPaymentSchema>>
) =>
  db
    .update(payments)
    .set(values)
    .where(eq(payments.id, id))
    .returning()
    .execute();

export const updatePaymentByUserAndId = (
  userId: string,
  id: string,
  values: z.infer<typeof secureUpdateSchema>
) =>
  Application.instance.db.transaction(async (tx) => {
    const qApps = tx.$with("qApps").as(
      tx
        .select({ id: apps.id, walletId: sql`${wallets.id}`.as("walletId") })
        .from(apps)
        .innerJoin(wallets, eq(wallets.app, apps.id))
        .where(eq(apps.user, userId))
    );

    return tx
      .with(qApps)
      .update(payments)
      .set(values)
      .where(
        and(
          eq(
            payments.wallet,
            sql`(select ${qApps.walletId} from ${qApps} where ${qApps.walletId} = ${payments.wallet}  LIMIT 1)`
          ),
          eq(payments.id, id)
        )
      )
      .returning()
      .execute();
  });

export const verifySolanaPayment = async <
  T extends Omit<z.infer<typeof selectPaymentSchema>, "wallet" | "app">,
  U extends Omit<z.infer<typeof selectWalletSchema>, "app">
>(
  payment: T,
  wallet: U,
  connection: Connection
) => {
  if (payment.isVerified) return payment;

  if (payment.signature) {
    let updatedPayment = null;

    const transferInfos = await parseTransactionTransfers(
      payment.signature,
      connection
    );
    for (const transferInfo of transferInfos) {
      if (
        transferInfo.mint === payment.mint &&
        transferInfo.authority === payment.customer &&
        transferInfo.tokenAmount &&
        transferInfo.tokenAmount.amount === payment.amount
      ) {
        const destination = getAssociatedTokenAddressSync(
          new PublicKey(transferInfo.mint),
          new PublicKey(wallet.address)
        );
        if (destination.equals(new PublicKey(transferInfo.destination)))
          updatedPayment = (
            await updatePaymentById(payment.id, {
              isVerified: true,
            })
          ).at(0)!;
      } else if (transferInfo.lamports) {
        if (payment.amount.toString() === transferInfo.lamports.toString())
          updatedPayment = (
            await updatePaymentById(payment.id, { isVerified: true })
          ).at(0)!;
      }
    }

    if (updatedPayment) payment.isVerified = updatedPayment.isVerified;
  }

  return payment;
};

export const verifyPaymentBy = async (where: SQL, connection: Connection) => {
  const payment = await db.query.payments
    .findFirst({
      where,
      with: {
        wallet: {
          with: {
            app: {
              with: { apiKey: { columns: { secretKey: true } } },
              columns: { id: true },
            },
          },
          columns: {
            app: false,
          },
        },
      },
      columns: { wallet: false },
    })
    .execute();

  if (payment) {
    if (payment.wallet) {
      switch (payment.wallet.chain) {
        case "solana":
          return verifySolanaPayment(payment, payment.wallet, connection);
      }
    }
  }

  return null;
};

export const verifyPaymentById = (id: string, connection: Connection) =>
  verifyPaymentBy(eq(payments.id, id), connection);

export const verifyPaymentBySignature = (
  signature: string,
  connection: Connection
) => verifyPaymentBy(eq(payments.signature, signature), connection);
