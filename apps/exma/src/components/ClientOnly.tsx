"use client";
import { SDKProvider } from "@telegram-apps/sdk-react";
import { ServerExmaProvider, type EmbeddedWallet } from "@saitamafun/wallet";
import { PermissionProvider } from "@saitamafun/wallet/providers/server";

import ExmaModal from "./ExmaModal";
import React from "react";

type ClientOnlyProps = {
  wallets: EmbeddedWallet[];
  config: Record<string, any>;
  isTelegramContext?: boolean;
} & Omit<
  React.ComponentProps<typeof ServerExmaProvider>,
  "rpcURL" | "token" | "baseURL" | "wallets"
> &
  Omit<
    React.ComponentProps<typeof ExmaModal>,
    "connection" | "open" | "setOpen" | "api"
  >;

export default function ClientOnly({
  config,
  isTelegramContext,
  ...props
}: ClientOnlyProps) {
  const TelegramProvider = ({ children }: React.PropsWithChildren) =>
    isTelegramContext ? (
      <SDKProvider>{children}</SDKProvider>
    ) : (
      <React.Fragment>{children}</React.Fragment>
    );

  return (
    <PermissionProvider>
      <ServerExmaProvider
        token={config.accessToken}
        baseURL={config.endpoint}
        rpcURL={config.rpcEndpoint}
        {...props}
      >
        <TelegramProvider>
          <ExmaModal {...props} />
        </TelegramProvider>
      </ServerExmaProvider>
    </PermissionProvider>
  );
}
