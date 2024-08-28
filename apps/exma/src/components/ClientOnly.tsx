"use client";
import { ServerExmaProvider, type EmbeddedWallet } from "@saitamafun/wallet";

import ExmaModal from "./ExmaModal";
import { PermissionProvider } from "@saitamafun/wallet/providers/server";

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