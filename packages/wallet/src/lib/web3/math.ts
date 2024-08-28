import BN from "bn.js";
import { safeBN, unsafeBnToNumber } from "@solocker/safe-bn";

export function toUIAmount(amount: bigint, decimals: number) {
  return unsafeBnToNumber(
    safeBN(new BN(amount.toString()), decimals).div(
      new BN(10).pow(new BN(decimals))
    ),
    decimals
  );
}
