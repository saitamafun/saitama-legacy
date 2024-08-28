import type { DigitalAssetWithToken } from "@metaplex-foundation/mpl-token-metadata";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

import { number, object, string } from "yup";

import { isPublicKey } from "../lib/web3/utils";
import type { RefinedEmbeddeWallet } from "../lib/api/models/embeddedWallet.model";

export type SendTokenForm = {
  address: string;
  amount: string;
};

export const sendTokenValidationSchema = object().shape({
  address: string().test("test-address", "Invalid address", isPublicKey),
  amount: number().moreThan(0).required(),
});

export const processSendTokenForm = async (
  connection: Connection,
  wallet: RefinedEmbeddeWallet,
  token: DigitalAssetWithToken["token"] & DigitalAssetWithToken["mint"],
  form: SendTokenForm
) => {
  const amount = Number(form.amount) * Math.pow(10, token.decimals);
  const sender = new PublicKey(wallet.publicKey);
  const recipient = new PublicKey(form.address);
  const ixs: TransactionInstruction[] = [];

  if (token.isNative) {
    ixs.push(
      SystemProgram.transfer({
        fromPubkey: sender,
        toPubkey: recipient,
        lamports: amount,
      })
    );
  } else {
    const mint = new PublicKey(token.mint);
    const senderAta = getAssociatedTokenAddressSync(mint, sender);
    const recipientAta = getAssociatedTokenAddressSync(mint, recipient);

    ixs.push(
      createAssociatedTokenAccountIdempotentInstruction(
        sender,
        recipientAta,
        recipient,
        mint
      ),
      createTransferCheckedInstruction(
        senderAta,
        mint,
        recipientAta,
        sender,
        amount,
        token.decimals
      )
    );
  }

  const replaceRecentBlockhash = await connection.getLatestBlockhash();

  const transaction = new Transaction().add(...ixs);

  transaction.feePayer = new PublicKey(wallet.publicKey);
  transaction.recentBlockhash = replaceRecentBlockhash.blockhash;

  return transaction;
};
