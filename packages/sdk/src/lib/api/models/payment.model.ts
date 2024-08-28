import type { Wallet } from "./wallet.model";

export type Payment = {
  id: string;
  amount: number | string | bigint;
  wallet: Wallet;
  mint: string | undefined;
  customer: string;
  isVerified: string;
  createdAt: string;
  signature: string | null;
  description: string | null;
};
