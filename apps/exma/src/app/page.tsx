import cookie from "cookie";
import { Connection } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { cookies } from "next/headers";
import { AuthUserApi, SafeJson, type User } from "@saitamafun/wallet/lib";

import { getConfig, isConfigValid } from "../config";
import ClientOnly from "../components/ClientOnly";
import ErrorMessage from "../components/ErrorMessage";
import useServerProps from "../composables/useServerProps";
import TelegramProvider from "../providers/TelegramProvider";

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

  const accessToken = cookies().get("accessToken");

  const api = new AuthUserApi(
    config.endpoint,
    accessToken && accessToken.value
      ? accessToken.value
      : firstPartyCookies.accessToken,
    cookies().toString()
  );

  const user: User = await api.user
    .get("me")
    .then(({ data }) => data)
    .catch(() => null);

  const [wallets, porfolio, nftPortfolio] = await useServerProps({
    api,
    connection,
    umi,
    user,
  });

  return user ? (
    <ClientOnly
      user={user}
      config={config}
      wallets={wallets}
      portfolio={{ data: porfolio }}
      nftPortfolio={{ data: nftPortfolio }}
      firstPartyCookies={firstPartyCookies}
    />
  ) : (
    <TelegramProvider
      user={user}
      config={config}
      wallets={wallets}
      portfolio={{ data: porfolio }}
      nftPortfolio={{ data: nftPortfolio }}
      firstPartyCookies={firstPartyCookies}
    />
  );
}
