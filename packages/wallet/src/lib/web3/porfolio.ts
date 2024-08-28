import { NATIVE_MINT } from "@solana/spl-token";
import type { Connection, PublicKey } from "@solana/web3.js";

import { publicKey, type Umi } from "@metaplex-foundation/umi";
import { fetchAssetsByOwner } from "@metaplex-foundation/mpl-core";
import { fetchAllDigitalAssetWithTokenByOwner } from "@metaplex-foundation/mpl-token-metadata";

import { getDefaultDigitalAssetWithToken } from "./metadata";

export const fetchTokenPorfolio = async (
  connection: Connection,
  umi: Umi,
  account: string | PublicKey
) => {
  const nonNativeTokens = await fetchAllDigitalAssetWithTokenByOwner(
    umi,
    publicKey(account)
  );

  const nativeToken = await getDefaultDigitalAssetWithToken(
    connection,
    publicKey(account),
    NATIVE_MINT.toBase58(),
    { name: "Solana", symbol: "SOL" }
  );

  return [nativeToken, ...nonNativeTokens];
};

export const fetchNFTPortfolio = (umi: Umi, account: string | PublicKey) => {
  return fetchAssetsByOwner(umi, publicKey(account), {
    skipDerivePlugins: false,
  });
};
