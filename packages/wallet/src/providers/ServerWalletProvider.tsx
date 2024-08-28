"use client";

import { Connection } from "@solana/web3.js";

import type { AssetV1 } from "@metaplex-foundation/mpl-core";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import type { DigitalAssetWithToken } from "@metaplex-foundation/mpl-token-metadata";

import { useState, useMemo } from "react";
import type { UseQueryResult } from "@tanstack/react-query";

import { WalletContext } from "./WalletProvider";
import type {
  EmbeddedWallet,
  RefinedEmbeddeWallet,
} from "../lib/api/models/embeddedWallet.model";
import { EmbeddedWalletApi } from "../lib";

type WalletProviderProps = {
  rpcURL: string;
  portfolio: Partial<UseQueryResult<DigitalAssetWithToken[], Error> | null>;
  nftPortfolio: Partial<UseQueryResult<AssetV1[], Error> | null>;
  wallets: EmbeddedWallet[];
} & React.PropsWithChildren;

export default function ServerWalletProvider({
  children,
  rpcURL,
  portfolio,
  nftPortfolio,
  wallets,
}: WalletProviderProps) {
  const umi = useMemo(() => createUmi(rpcURL), [rpcURL]);
  const connection = useMemo(() => new Connection(rpcURL), [rpcURL]);

  const [wallet, setWallet] = useState<RefinedEmbeddeWallet>();

  const refinedWallets = useMemo(
    () => EmbeddedWalletApi.refineWallets(wallets),
    [wallets]
  );

  return (
    <WalletContext.Provider
      value={{
        umi,
        connection,
        portfolio,
        nftPortfolio,
        wallet,
        setWallet,
        wallets: refinedWallets,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
