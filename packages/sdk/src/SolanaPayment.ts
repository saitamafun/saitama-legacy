import { web3, Program, BN } from "@coral-xyz/anchor";
import { type Bofoi, getReceiptPda, getStatePda } from "@saitamafun/bofoi";
import {
  getAssociatedTokenAddressSync,
  NATIVE_MINT,
  NATIVE_MINT_2022,
} from "@solana/spl-token";

import { Api, type Payment } from "./lib";

export class SolanaPayment {
  constructor(
    private readonly program: Program<Bofoi>,
    private readonly api: Api
  ) {}

  static isNative(mint: web3.PublicKey) {
    return NATIVE_MINT.equals(mint) || NATIVE_MINT_2022.equals(mint);
  }

  readonly initializePayment = async (payment: Payment, isNative: boolean) => {
    const { amount, wallet } = payment;

    const sender = this.program.provider.publicKey!;
    const recipient = new web3.PublicKey(wallet.address);
    const data = Buffer.from(JSON.stringify({ id: payment.id })).toString(
      "binary"
    );

    const [statePda] = getStatePda();
    const state = await this.program.account.initializeState.fetch(statePda);
    const [receipt] = getReceiptPda(state, sender);

    const instructions: web3.TransactionInstruction[] = [];

    if (isNative) {
      instructions.push(
        await this.program.methods
          .nativeTransfer(new BN(amount.toString()), data)
          .accounts({
            state: statePda,
            from: sender,
            to: recipient,
            receipt,
          })
          .instruction()
      );
    } else {
      const mint = new web3.PublicKey(payment.mint!);

      const senderAta = getAssociatedTokenAddressSync(mint, sender, true);
      const recipientAta = getAssociatedTokenAddressSync(mint, recipient, true);

      instructions.push(
        await this.program.methods
          .splTransfer(new BN(amount.toString()), data)
          .accounts({
            receipt,
            from: sender,
            to: recipient,
            fromAta: senderAta,
            toAta: recipientAta,
            state: statePda,
            mint,
          })
          .instruction()
      );
    }

    const transaction = new web3.Transaction().add(...instructions);

    const signature = await this.program.provider.sendAndConfirm!(
      transaction,
      undefined,
      { commitment: "single" }
    );

    return this.api.payment
      .update(payment.id, { signature })
      .then(({ data }) => data);
  };
}
