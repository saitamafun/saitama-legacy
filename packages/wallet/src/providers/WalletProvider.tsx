"use client";

import type { Connection } from "@solana/web3.js";

import type { Umi } from "@metaplex-foundation/umi";
import type { AssetV1 } from "@metaplex-foundation/mpl-core";
import type { DigitalAssetWithToken } from "@metaplex-foundation/mpl-token-metadata";

import { useState } from "react";
import { createContext } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { useExma } from "../composables";
import type { RefinedEmbeddeWallet } from "../lib/api/models/embeddedWallet.model";
import { fetchNFTPortfolio, fetchTokenPorfolio } from "../lib/web3/porfolio";

export type WalletContext = {
  connection: Connection;
  umi: Umi;
  wallet: RefinedEmbeddeWallet;
  wallets: RefinedEmbeddeWallet[];
  setWallet: React.Dispatch<
    React.SetStateAction<RefinedEmbeddeWallet | undefined>
  >;
  portfolio: Partial<UseQueryResult<DigitalAssetWithToken[], Error>> | null;
  nftPortfolio: Partial<UseQueryResult<AssetV1[], Error>> | null;
};

export const WalletContext = createContext<Partial<WalletContext>>({});

type WalletProviderProps = {
  umi: Umi;
  connection: Connection;
} & React.PropsWithChildren;

export default function WalletProvider({
  children,
  connection,
  umi,
}: WalletProviderProps) {
  const { authUserApi } = useExma();
  const [wallet, setWallet] = useState<RefinedEmbeddeWallet>();

  const portfolio = useQuery({
    queryKey: [wallet, "tokens"],
    queryFn: async () => fetchTokenPorfolio(connection, umi, wallet!.publicKey),
    enabled: Boolean(wallet),
  });

  const nftPortfolio = useQuery({
    queryKey: [wallet, "nfts"],
    queryFn: () => fetchNFTPortfolio(umi, wallet!.publicKey),
    enabled: Boolean(wallet),
  });

  const { data: wallets } = useQuery({
    queryKey: [authUserApi],
    queryFn: () => authUserApi.wallet.getWallets(),
    enabled: Boolean(authUserApi),
  });

  return (
    <WalletContext.Provider
      value={{
        portfolio,
        nftPortfolio,
        wallet,
        setWallet,
        wallets,
        connection,
        umi,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
