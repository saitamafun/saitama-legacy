"use client";

import React from "react";
import { ServerExmaProvider, type EmbeddedWallet } from "@saitamafun/wallet";
import { PermissionProvider } from "@saitamafun/wallet/providers/server";

import ExmaModal from "./ExmaModal";

type ClientOnlyProps = {
  wallets: EmbeddedWallet[];
  config: Record<string, any>;
} & Omit<
  React.ComponentProps<typeof ServerExmaProvider>,
  "rpcURL" | "token" | "baseURL" | "wallets"
> &
  Omit<
    React.ComponentProps<typeof ExmaModal>,
    "connection" | "open" | "setOpen" | "api"
  >;

export default function ClientOnly({ config, ...props }: ClientOnlyProps) {
  return (
    <PermissionProvider>
      <ServerExmaProvider
        token={config.accessToken}
        baseURL={config.endpoint}
        rpcURL={config.rpcEndpoint}
        {...props}
      >
        <ExmaModal {...props} />
      </ServerExmaProvider>
    </PermissionProvider>
  );
}
