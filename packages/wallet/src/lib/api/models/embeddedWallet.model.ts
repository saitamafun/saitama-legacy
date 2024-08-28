import { PublicKey } from "@solana/web3.js";

export type EmbeddedWallet = {
  id: string;
  publicKey: string;
};


export type RefinedEmbeddeWallet = {
  id: string;
  publicKey: PublicKey
}