"use client";
import cookies from "js-cookie";
import { Connection } from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";
import { Api, AuthUserApi, type User } from "@saitamafun/wallet";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import type { getConfig } from "../config";
import type { LoadingState } from "../types";
import ClientOnly from "../components/ClientOnly";
import useServerProps from "../composables/useServerProps";
import useLocation from "../composables/useLocation";

type TelegramProviderProps = {
  config: ReturnType<typeof getConfig>;
} & Omit<React.ComponentProps<typeof ClientOnly>, "isTelegramContext">;

export default function TelegramProvider({
  config,
  ...props
}: TelegramProviderProps) {
  const [state, setState] = useState<LoadingState>("idle");
  const location = useLocation();

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
    if (location) {
      const [, initData] = location.href.split(/#tgWebAppData=/);
      props.user = await getUser(initData);
      if (props.user) {
        const accessToken = cookies.get("accessToken");
        const api = new AuthUserApi(config.endpoint, accessToken);

        [props.wallets, props.portfolio.data, props.nftPortfolio.data] =
          await useServerProps({ api, connection, umi, user: props.user });
      }
    }
  }, [location]);

  useEffect(() => {
    setState("loading");
    fetchProps()
      .then(() => setState("success"))
      .catch(() => setState("error"));
  }, [fetchProps, setState]);

  if (["idle", "loading"].includes(state))
    return (
      <div className="flex-1 flex flex-col">
        <div className="m-auto w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin dark:border-white dark:border-t-transparent" />
      </div>
    );
  else
    return (
      <ClientOnly
        config={config}
        isTelegramContext
        {...props}
      />
    );
}
