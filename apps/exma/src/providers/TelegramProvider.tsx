"use client";
import cookies from "js-cookie";
import { Connection } from "@solana/web3.js";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Api, AuthUserApi, type User } from "@saitamafun/wallet";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { retrieveLaunchParams, SDKProvider } from "@telegram-apps/sdk-react";

import type { getConfig } from "../config";
import type { LoadingState } from "../types";
import ClientOnly from "../components/ClientOnly";
import useServerProps from "../composables/useServerProps";
import useLocation from "../composables/useLocation";

type TelegramProviderProps = {
  config: ReturnType<typeof getConfig>;
} & Omit<React.ComponentProps<typeof ClientOnly>, "isTelegramContext">;

const TelegramProvider = ({
  children,
  isTelegramContext,
}: React.PropsWithChildren & { isTelegramContext: boolean }) =>
  isTelegramContext ? (
    <SDKProvider>{children}</SDKProvider>
  ) : (
    <React.Fragment>{children}</React.Fragment>
  );

export default function (props: TelegramProviderProps) {
  const location = useLocation();
  const isTelegramContext = useMemo(() => {
    if (location) {
      const [, initData] = location.href.split(/#tgWebAppData=/);
      return Boolean(initData);
    }

    return false;
  }, [location]);

  return (
    <TelegramProvider isTelegramContext={isTelegramContext}>
      <InnerTelegramProvider
        {...props}
        isTelegramContext={isTelegramContext}
      />
    </TelegramProvider>
  );
}

function InnerTelegramProvider({
  config,
  isTelegramContext,
  ...props
}: TelegramProviderProps & { isTelegramContext: boolean }) {
  const [state, setState] = useState<LoadingState>("idle");
  const initData = isTelegramContext
    ? retrieveLaunchParams().initDataRaw
    : undefined;

  const getUser = (initData?: string | null): Promise<User | undefined> => {
    const accessToken = cookies.get("accessToken");

    if (accessToken) {
      const api = new AuthUserApi(config.endpoint, accessToken);

      const user = api.user
        .get("me")
        .then(({ data }) => data)
        .catch(() => {
          cookies.remove("accessToken");
          return null;
        });
      if (user) return user;
    }

    if (initData) {
      const api = new Api(config.endpoint, config.accessToken);
      return api.auth
        .telegramAuthentication(initData)
        .then(({ data: { token, user } }) => {
          cookies.set("accessToken", token);
          props.firstPartyCookies.accessToken = token;
          return user;
        })
        .catch(() => null);
    }

    return undefined;
  };

  const connection = new Connection(config.rpcEndpoint);
  const umi = createUmi(connection);

  const fetchProps = useCallback(async () => {
    props.user = await getUser(
      initData ? decodeURIComponent(initData) : undefined
    );
    if (props.user) {
      const accessToken = cookies.get("accessToken");
      const api = new AuthUserApi(config.endpoint, accessToken);

      [props.wallets, props.portfolio.data, props.nftPortfolio.data] =
        await useServerProps({ api, connection, umi, user: props.user });
    }
  }, []);

  useEffect(() => {
    setState("loading");
    fetchProps()
      .then(() => setState("success"))
      .catch(() => setState("error"));
  }, [fetchProps, setState]);

  console.log(props);

  if (["idle", "loading"].includes(state))
    return (
      <div className="flex-1 flex flex-col">
        <div className="m-auto w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin dark:border-white dark:border-t-transparent" />
      </div>
    );
  else
    return (
      <ClientOnly
        {...props}
        config={config}
      />
    );
}
