import type { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  AuthUserApi,
  fetchNFTPortfolio,
  fetchTokenPorfolio,
  type EmbeddedWallet,
  type User,
} from "@saitamafun/wallet";
import type { Connection } from "@solana/web3.js";

type UserServerArgs = {
  user: User | null;
  connection: Connection;
  umi: ReturnType<typeof createUmi>;
  api: AuthUserApi;
};

export default async function useServerProps({
  api,
  connection,
  umi,
  user,
}: UserServerArgs) {
  const wallets = user
    ? await api.wallet.getPlainWallets()
    : new Array<EmbeddedWallet>();

  const porfolio =
    wallets && wallets.length > 0
      ? await fetchTokenPorfolio(connection, umi, wallets.at(0)!.publicKey)
      : undefined;

  const nftPortfolio =
    wallets && wallets.length > 0
      ? await fetchNFTPortfolio(umi, wallets.at(0)!.publicKey)
      : undefined;

  return [wallets, porfolio, nftPortfolio] as const;
}
