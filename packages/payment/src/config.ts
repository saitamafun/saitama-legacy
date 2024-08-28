import { type  Mint, NATIVE_MINT } from "@solana/spl-token";

export const defaultMintMetadata= {
  name: "Solana",
  symbol: "SOL",
  image: "",
};

export const defaultMintInfo: Mint = {
  decimals: 9,
  address: NATIVE_MINT,
  mintAuthority: null,
  supply: BigInt(0),
  isInitialized: false,
  freezeAuthority: null,
  tlvData: Buffer.from([0]),
};
