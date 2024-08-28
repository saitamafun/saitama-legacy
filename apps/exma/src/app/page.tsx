import cookie from "cookie";
import { Connection } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { cookies } from "next/headers";
import {
  AuthUserApi,
  fetchTokenPorfolio,
  fetchNFTPortfolio,
  type EmbeddedWallet,
} from "@saitamafun/wallet/lib";

import { getConfig, isConfigValid } from "../config";
import ClientOnly from "../components/ClientOnly";
import ErrorMessage from "../components/ErrorMessage";

export default async function HomePage(props: Record<string, any>) {
  const config = getConfig(props.searchParams.hash);
  const firstPartyCookies = cookie.parse(
    props.searchParams.cookies ? decodeURI(props.searchParams.cookies) : ""
  );

  if (!isConfigValid(config))
    return (
      <ErrorMessage
        className="m-auto text-center max-w-xs px-8"
        title="Invalid url params"
        message="Make sure url has rpcEndpoint and accessToken as search params"
        description={
          <span className="inline">
            <span className="shrink-0">Make sure url has&nbsp;</span>
            <pre className="inline bg-black/10 rounded p-0.5 dark:bg-white/10">
              rpcEndpoint
            </pre>
            &nbsp;and&nbsp;
            <pre className="inline bg-black/10 rounded p-0.5 dark:bg-white/10">
              accessToken
            </pre>
            &nbsp; as search params
          </span>
        }
      />
    );

  const umi = createUmi(config.rpcEndpoint);
  const connection = new Connection(config.rpcEndpoint);

  const api = new AuthUserApi(
    config.endpoint,
    firstPartyCookies.accessToken,
    cookies().toString()
  );

  const user = await api.user
    .get("me")
    .then(({ data }) => data)
    .catch(() => null);

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

  return (
    <ClientOnly
      user={user}
      config={config}
      wallets={wallets}
      portfolio={{ data: porfolio }}
      nftPortfolio={{ data: nftPortfolio }}
      firstPartyCookies={firstPartyCookies}
    />
  );
}
