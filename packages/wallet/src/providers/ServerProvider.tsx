"use client";

import { QueryClientProvider } from "@tanstack/react-query";

import { useMemo, useState } from "react";

import { ExmaContext } from ".";
import { queryClient } from "../client";
import { Api, AuthUserApi, type User } from "../lib/api";
import FirebaseProvider from "./FirebaseProvider";
import ServerWalletProvider from "./ServerWalletProvider";
import PolyfillCookieProvider from "./PolyfillCookieProvider";

type ServerExmaProviderProps = {
  token: string;
  baseURL: string;
  user: User | null;
  firstPartyCookies: Record<string, any>;
} & React.ComponentProps<typeof ServerWalletProvider> &
  React.PropsWithChildren;

export function ServerExmaProvider({
  children,
  firstPartyCookies,
  ...props
}: ServerExmaProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <PolyfillCookieProvider
        firstPartyCookies={firstPartyCookies}
        defaultSetOptions={{
          sameSite: "none",
          secure: true,
        }}
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
  user: serverUser,
  ...props
}: Omit<ServerExmaProviderProps, "firstPartyCookies">) {
  const api = useMemo(() => new Api(baseURL, token), [token, baseURL]);
  const authUserApi = useMemo(
    () => (serverUser ? new AuthUserApi(baseURL) : undefined),
    [serverUser, baseURL]
  );

  const [user, setUser] = useState<User | null>(serverUser);

  return (
    <ExmaContext.Provider value={{ api, authUserApi, user, setUser }}>
      <FirebaseProvider
        isFetched
        serverUser={user}
        setServerUser={setUser}
      >
        <ServerWalletProvider {...props}>{children}</ServerWalletProvider>
      </FirebaseProvider>
    </ExmaContext.Provider>
  );
}
