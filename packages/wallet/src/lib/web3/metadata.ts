import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { none, publicKey, some } from "@metaplex-foundation/umi";
import { TokenState } from "@metaplex-foundation/mpl-toolbox";
import {
  type DigitalAsset,
  type DigitalAssetWithToken,
  type JsonMetadata,
  Key,
} from "@metaplex-foundation/mpl-token-metadata";

import { Api } from "../api";
import { isNative, truncateAddress } from "./utils";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

export const deadWallet = publicKey(SystemProgram.programId);
export const optionalDeadWallet = some(publicKey(SystemProgram.programId));

export const getDefaultDigitalAsset = (
  value: string,
  defaults?: { name: string; symbol: string }
): DigitalAsset => {
  const optionalValue = some(publicKey(value));

  const mint: DigitalAsset["mint"] = {
    isInitialized: true,
    mintAuthority: optionalValue,
    freezeAuthority: optionalValue,
    supply: 0n,
    publicKey: publicKey(value),
    decimals: 9,
    header: {
      executable: false,
      owner: deadWallet,
      lamports: {
        basisPoints: 0n,
        identifier: "SOL",
        decimals: 9,
      },
    },
  };

  const metadata: DigitalAsset["metadata"] = {
    uri: "",
    key: Key.MetadataV1,
    isMutable: false,
    updateAuthority: deadWallet,
    sellerFeeBasisPoints: 0,
    mint: publicKey(value),
    name: defaults?.name ?? "UNKNOWN TOKEN",
    symbol: defaults?.symbol ?? truncateAddress(value),
    tokenStandard: none(),
    collection: none(),
    collectionDetails: none(),
    creators: none(),
    editionNonce: none(),
    uses: none(),
    header: {
      executable: false,
      owner: deadWallet,
      lamports: {
        basisPoints: 0n,
        identifier: "SOL",
        decimals: 9,
      },
    },
    primarySaleHappened: true,
    programmableConfig: none(),
    publicKey: publicKey(value),
  };

  return {
    mint,
    metadata,
    publicKey: publicKey(value),
  };
};

export const getDefaultJsonMetadata = (mint: string): JsonMetadata =>
  isNative(mint)
    ? {
        image:
          "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
      }
    : { image: undefined };

export const safeFetchAllDigitalAsset = async (
  api: Api,
  mints: string[]
): Promise<DigitalAsset[]> => {
  const { data } = await api.rpc.getAllDigitalAsset(mints);
  const placeholder = mints
    .filter(
      (mint) => !Boolean(data.find(({ publicKey }) => publicKey === mint))
    )
    .map((mint) =>
      getDefaultDigitalAsset(
        mint,
        isNative(mint) ? { name: "Solana", symbol: "SOL" } : undefined
      )
    );

  return [...data, ...placeholder];
};

export const getDefaultDigitalAssetWithToken = async (
  connection: Connection,
  owner: string,
  ...args: Parameters<typeof getDefaultDigitalAsset>
): Promise<DigitalAssetWithToken> => {
  const digitalAsset = getDefaultDigitalAsset(...args);

  const account = new PublicKey(owner);
  const mint = new PublicKey(digitalAsset.publicKey);

  const tokenAccountAta = isNative(mint.toBase58())
    ? null
    : getAssociatedTokenAddressSync(mint, account);

  const tokenAmount = tokenAccountAta
    ? await connection
        .getTokenAccountBalance(tokenAccountAta)
        .then(({ value }) => ({
          amount: BigInt(value.amount),
          decimals: value.decimals,
        }))
    : {
        amount: BigInt(await connection.getBalance(account)),
        decimals: 9,
      };

  const digitalAssetWithToken = {
    ...digitalAsset,
    token: {
      mint: digitalAsset.publicKey,
      owner: publicKey(owner),
      amount: tokenAmount.amount,
      delegate: none<import("@metaplex-foundation/umi").PublicKey>(),
      state: TokenState.Initialized,
      isNative: some(0n),
      delegatedAmount: 0n,
      closeAuthority: none<import("@metaplex-foundation/umi").PublicKey>(),
      publicKey: publicKey(tokenAccountAta ?? account),
      header: digitalAsset.mint.header,
    },
  };

  digitalAssetWithToken.mint.decimals = tokenAmount.decimals;

  return digitalAssetWithToken;
};
