import BN from "bn.js";
import { safeBN, unsafeBnToNumber } from "@solocker/safe-bn";

export const toUIAmount = (amount: string, decimals: number) =>
  unsafeBnToNumber(
    safeBN(new BN(amount), decimals).div(new BN(10).pow(new BN(decimals))),
    decimals
  );

export const Explorer = {
  buildTx(signature: string) {
    return `https://solscan.io/tx/${signature}?cluster=devnet`;
  },
  buildAccount(signature: string) {
    return `https://solscan.io/account/${signature}?cluster=devnet`;
  },
  buildRaydium(mint: string) {
    return `https://raydium.io/swap/?inputMint=sol&outputMint=${mint}`;
  },
};
