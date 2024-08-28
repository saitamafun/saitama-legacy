import type { SendTransactionOptions } from "@solana/wallet-adapter-base";
import type { DigitalAssetWithToken } from "@metaplex-foundation/mpl-token-metadata";

import type { Provider } from "./utils";
import type { useCookies } from "react-cookie";

export type CookieSetOptions = Parameters<ReturnType<typeof useCookies>[1]>[2];

export namespace PreEvent {
  export type TransactionEvent = {
    event: "transaction.approve";
    id: string;
    data: {
      rpcEndpoint: string;
      message: number[];
      options?: SendTransactionOptions;
    };
  };
  export type AuthenticateUserEvent = {
    event: "authentication.user";
    id: string;
    data: {
      provider: Provider;
      payload: {
        id: string;
      };
    };
  };

  export type SelectMintEvent = {
    event: "select.mint";
    id: string;
    data: null;
  };

  export type WalletFundEvent = {
    event: "wallet.fund";
    id: string;
    data: null;
  };

  export type Event =
    | TransactionEvent
    | AuthenticateUserEvent
    | SelectMintEvent
    | WalletFundEvent;
}

export namespace PostEvent {
  export type TransactionEvent = {
    event: "transaction";
    id?: string;
    data: {
      error: Error | null;
      signature: string | null;
    };
  };

  export type ModalEvent = {
    event: "modal";
    id?: string;
    data: {
      open: boolean;
    };
  };

  export type WalletEvent = {
    event: "wallet";
    id?: string;
    data: {
      status: "connected" | "authenticating";
      publicKey?: string;
    };
  };

  export type WalletErrorEvent = {
    event: "wallet.error";
    id?: string;
    data: {
      message: string;
    };
  };

  export type AuthenticationInitialize = {
    event: "authentication.initialize";
    id?: string;
    data: {
      provider: Provider;
    };
  };

  export type SelectMintEvent = {
    event: "select.mint";
    id?: string;
    data: DigitalAssetWithToken;
  };

  export type SetCookieEvent = {
    event: "set.cookie";
    id?: string;
    data: {
      name: string;
      value: string;
      options: CookieSetOptions;
    };
  };

  export type DeleteCookieEvent = {
    event: "delete.cookie";
    id?: string;
    data: {
      name: string;
      options: CookieSetOptions;
    };
  };

  export type Event =
    | TransactionEvent
    | ModalEvent
    | WalletEvent
    | WalletErrorEvent
    | AuthenticationInitialize
    | SelectMintEvent
    | SetCookieEvent
    | DeleteCookieEvent;
}
