import {  type TokenAmount } from "@solana/web3.js";

export type Portfolio = {
  tokenAccount: {
    type: "account";
    info: {
      isNative: boolean;
      mint: string;
      owner: string;
      state: "initialized";
      tokenAmount: TokenAmount;
    };
  };
  metadata: {
    mint: string;
    name: string;
    symbol: string;
    uri?: string;
    json: Partial<{
      name: string;
      symbol: string;
      description: string;
      image: string;
      external_link: string;
    }> | null;
  };
};
