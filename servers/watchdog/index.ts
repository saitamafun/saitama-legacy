import "dotenv/config";

import { web3, type Program } from "@coral-xyz/anchor";
import { type Bofoi, getProgram } from "@saitamafun/bofoi";
import { sendWebhookEvent, verifyPaymentBySignature } from "kamikaze";

const onTransferEvent = (program: Program<Bofoi>) => {
  const transferEvent = async (signature: string) => {
    const payment = await verifyPaymentBySignature(
      signature,
      program.provider.connection as any
    );

    if (payment) {
      if (payment.wallet) {
        await sendWebhookEvent(
          payment.wallet.app.id,
          "payment.success",
          payment,
          payment.wallet.app.apiKey.secretKey
        );
      }
    }
  };
  return program.addEventListener("TransferEvent", (_, __, signature) => {
    console.log("signature=", signature);
    /// Safe paranoid
    try {
      transferEvent(signature).catch(() => null);
    } catch {}
  });
};

const main = () => {
  const connection = new web3.Connection(process.env.RPC_URL!, {
    wsEndpoint: process.env.WS_URL!,
  });
  const program = getProgram({ connection });

  console.log("[Watchdog] Running in background...");

  const transferEventSubId = onTransferEvent(program);

  return async () => {
    await program.removeEventListener(transferEventSubId);
  };
};

const unsubscribe = main();

process.once("SIGINT", unsubscribe);
process.once("SIGTERM", unsubscribe);
