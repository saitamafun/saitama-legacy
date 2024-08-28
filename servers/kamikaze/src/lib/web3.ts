import { publicKey, type Umi } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { dasApi } from "@metaplex-foundation/digital-asset-standard-api";

import {
  fetchAllDigitalAsset,
  type DigitalAsset,
} from "@metaplex-foundation/mpl-token-metadata";

import {
  clusterApiUrl,
  Connection,
  SystemProgram,
  type TokenAmount,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

import { RPC_URL } from "@/config";

import { Application } from "../singleton";
import { SafeJson } from "./utils";

export const umi = createUmi(RPC_URL).use(dasApi());
export const connection = new Connection(clusterApiUrl("devnet"));

export const transferTxTypes = ["transferchecked", "transfer"];

export type TransferInfo = {
  destination: string;
  lamports: number;
  amount: string;
  source: string;
  mint?: string;
  authority?: string;
  tokenAmount?: TokenAmount;
};

export const parseTransactionTransfers = async (
  signature: string,
  connection: Connection
) => {
  const transferInfos: TransferInfo[] = [];
  const transaction = await connection.getParsedTransaction(signature, {
    maxSupportedTransactionVersion: 0,
  });

  if (transaction) {
    const instructions = transaction?.transaction.message.instructions;
    if (transaction.meta && transaction.meta.innerInstructions)
      instructions.push(
        ...transaction.meta.innerInstructions?.flatMap(
          ({ instructions }) => instructions
        )
      );

    for (const instruction of instructions) {
      if (instruction) {
        if (
          "parsed" in instruction &&
          transferTxTypes.includes(instruction.parsed.type.toLowerCase()) &&
          (instruction.programId.equals(SystemProgram.programId) ||
            instruction.programId.equals(TOKEN_PROGRAM_ID) ||
            instruction.programId.equals(TOKEN_2022_PROGRAM_ID))
        ) {
          transferInfos.push(instruction.parsed.info);
        }
      }
    }
  }

  return transferInfos;
};

export const getAllDigitalAsset = async (umi: Umi, mints: string[]) => {
  const cached: DigitalAsset[] = [];
  const mintsNotCached: ReturnType<typeof publicKey>[] = [];

  for (const mint of mints) {
    const metadata = Application.instance.cache.get<DigitalAsset>(mint);

    if (metadata) cached.push(metadata);
    else mintsNotCached.push(publicKey(mint));
  }

  const digitalAssets = await fetchAllDigitalAsset(umi, mintsNotCached);

  const safeDigitalAssets: DigitalAsset[] = digitalAssets.map((digitalAsset) =>
    JSON.parse(SafeJson.stringify(digitalAsset))
  );

  safeDigitalAssets.forEach((digitalAsset) => {
    Application.instance.cache.set(digitalAsset.mint.publicKey, digitalAsset);
  });

  return [...cached, ...safeDigitalAssets];
};
