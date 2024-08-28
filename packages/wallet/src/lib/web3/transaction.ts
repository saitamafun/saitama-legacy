import { type RawAccount, ACCOUNT_SIZE, AccountLayout } from "@solana/spl-token";
import {
 type Connection,
  VersionedTransaction,
  PublicKey,
  type AccountInfo,
  SystemProgram,
  type Transaction,
  TransactionMessage,
} from "@solana/web3.js";

import { Api } from "../api";
import { isTokenAccount } from "./utils";
import { safeFetchAllDigitalAsset } from "./metadata";

export const simulateTransaction = async (
  api: Api,
  connection: Connection,
  transaction: VersionedTransaction,
  payer: PublicKey
) => {
  const writableAccounts = transaction.message.staticAccountKeys.filter(
    (_, index) => transaction.message.isAccountWritable(index)
  );

  const { value: fee } = await connection.getFeeForMessage(transaction.message);

  const accountInfos = await connection.getMultipleAccountsInfo(
    writableAccounts
  );

  const trackAccounts: PublicKey[] = [];

  const previousAccountStateLookupTable = new Map<
    string,
    RawAccount | AccountInfo<any>
  >();

  for (const [index, accountInfo] of accountInfos.entries()) {
    const account = writableAccounts[index];

    if (
      accountInfo &&
      isTokenAccount(accountInfo.owner) &&
      ACCOUNT_SIZE === accountInfo.data.length
    ) {
      const data = AccountLayout.decode(accountInfo.data);

      if (data.owner.equals(payer)) {
        previousAccountStateLookupTable.set(data.mint.toBase58(), data);
        trackAccounts.push(account);
      }
    } else if (
      accountInfo &&
      SystemProgram.programId.equals(accountInfo.owner) &&
      account.equals(payer)
    ) {
      previousAccountStateLookupTable.set(
        accountInfo.owner.toBase58(),
        accountInfo
      );
      trackAccounts.push(account);
    }
  }

  const mints = Array.from(previousAccountStateLookupTable.keys());

  const digitalAssets = await safeFetchAllDigitalAsset(api, mints);

  const {
    value: { accounts, ...logs },
  } = await connection.simulateTransaction(transaction, {
    accounts: {
      encoding: "base64",
      addresses: trackAccounts.map((account) => account.toBase58()),
    },
    replaceRecentBlockhash: true,
  });

  const accountChanges = [];

  if (accounts) {
    for (const account of accounts) {
      if (account && account.data) {
        const data = Buffer.from(account.data[0], "base64");
        const owner = new PublicKey(account.owner);

        if (isTokenAccount(owner) && data.length === ACCOUNT_SIZE) {
          const decodedData = AccountLayout.decode(data);
          const digitalAsset = digitalAssets.find(
            ({ mint }) => mint.publicKey === decodedData.mint.toBase58()
          )!;

          const previousAccountState = previousAccountStateLookupTable.get(
            decodedData.mint.toBase58()
          ) as RawAccount;

          accountChanges.push({
            digitalAsset,
            mint: decodedData.mint,
            preBalance: BigInt(previousAccountState.amount),
            postBalance: BigInt(decodedData.amount),
          });
        } else if (SystemProgram.programId.equals(owner)) {
          const digitalAsset = digitalAssets.find(
            ({ mint }) => mint.publicKey === owner.toBase58()
          )!;

          const previousAccountState = previousAccountStateLookupTable.get(
            owner.toBase58()
          ) as AccountInfo<Buffer>;

          accountChanges.push({
            digitalAsset,
            mint: SystemProgram.programId,
            preBalance: BigInt(previousAccountState.lamports),
            postBalance: BigInt(account.lamports),
          });
        }
      }
    }
  }

  return { fee, accounts: accountChanges, ...logs };
};

export const legacyTransactionToV0Transaction = async (
  connection: Connection,
  transaction: Transaction
) => {
  const replaceRecentBlockhash = await connection.getLatestBlockhash();
  const message = new TransactionMessage({
    payerKey: transaction.feePayer!,
    instructions: transaction.instructions,
    recentBlockhash: replaceRecentBlockhash.blockhash,
  }).compileToV0Message();

  return new VersionedTransaction(message);
};
