import { useContext } from "react";

import { WalletContext } from "../providers/WalletProvider";

export function useWallet() {
  return useContext(
    WalletContext
  ) as import("../providers/WalletProvider").WalletContext;
}
