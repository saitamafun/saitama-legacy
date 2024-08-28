import { BN } from "bn.js";
import { Program, type Provider, web3 } from "@coral-xyz/anchor";
import { type Bofoi, IDL } from "./types/bofoi";

export * from "./types/bofoi";

export const bofoiProgramId = new web3.PublicKey(
  "8Kc1XgpHpMEqC8nTEAzqXU61m9drjrEujLGMgDwXfk9r"
);

export const getStatePda = (programId = bofoiProgramId) =>
  web3.PublicKey.findProgramAddressSync([Buffer.from("bofoi")], programId);

export const getReceiptPda = (
  state: Awaited<
    ReturnType<Program<Bofoi>["account"]["initializeState"]["fetch"]>
  >,
  from: web3.PublicKey,
  programId = bofoiProgramId
) =>
  web3.PublicKey.findProgramAddressSync(
    [new BN(state.transferCount).toArrayLike(Buffer), from.toBuffer()],
    programId
  );

export const getProgram = (provider: Provider) =>
  new Program(IDL, bofoiProgramId, provider);
