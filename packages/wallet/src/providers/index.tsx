"use client";

import type { Connection } from "@solana/web3.js";
import type { Umi } from "@metaplex-foundation/umi";

import { createContext } from "react";
import { useMemo, useState } from "react";
import { useCookies } from "react-cookie";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";

import { queryClient } from "../client";
import { Api, AuthUserApi, type User } from "../lib/api";

import WalletProvider from "./WalletProvider";
import FirebaseProvider from "./FirebaseProvider";
import PolyfillCookieProvider from "./PolyfillCookieProvider";

export type ExmaContext = {
  api: Api;
  authUserApi: AuthUserApi;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

export const ExmaContext = createContext<Partial<ExmaContext>>({});

type ExmaProviderProps = {
  token: string;
  baseURL: string;
  connection: Connection;
  umi: Umi;
  firstPartyCookies: Record<string, any>;
} & React.PropsWithChildren;

export function ExmaProvider({
  children,
  firstPartyCookies,
  ...props
}: ExmaProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <PolyfillCookieProvider
        defaultSetOptions={{
          sameSite: "none",
          secure: true,
        }}
        firstPartyCookies={firstPartyCookies}
      >
        <ExmaInnerProvider {...props}>{children}</ExmaInnerProvider>
      </PolyfillCookieProvider>
    </QueryClientProvider>
  );
}

function ExmaInnerProvider({
  token,
  baseURL,
  children,
  umi,
  connection,
}: Omit<ExmaProviderProps, "firstPartyCookies">) {
  const [cookies, , removeCookie] = useCookies<
    "accessToken",
    { accessToken: string }
  >(["accessToken"]);

  const api = useMemo(() => new Api(token, baseURL), [token, baseURL]);
  const authUserApi = useMemo(
    () => new AuthUserApi(baseURL, cookies.accessToken),
    [cookies.accessToken, baseURL]
  );

  const [user, setUser] = useState<User | null>(null);
  const { isFetched } = useQuery({
    queryKey: [cookies.accessToken],
    queryFn: () => {
      return cookies.accessToken
        ? authUserApi!.user
            .get("me")
            .then(({ data }) => {
              setUser(data);
              return data;
            })
            .catch(() => {
              removeCookie("accessToken");
              return null;
            })
        : null;
    },
  });

  return (
    <ExmaContext.Provider value={{ api, authUserApi, user, setUser }}>
      <FirebaseProvider
        isFetched={isFetched}
        serverUser={user}
        setServerUser={setUser}
      >
        <WalletProvider
          umi={umi}
          connection={connection}
        >
          {children}
        </WalletProvider>
      </FirebaseProvider>
    </ExmaContext.Provider>
  );
}
