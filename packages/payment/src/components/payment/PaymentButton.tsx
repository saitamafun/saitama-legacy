import clsx from "clsx";
import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { getMint, type Mint } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import type { Payment } from "@saitamafun/sdk";
import { safeBN, unsafeBN } from "@solocker/safe-bn";

import { useApi, useApp } from "../../composables";
import { PaymentModal } from "./PaymentModal";
import { Loading } from "../Loading";
import BN from "bn.js";
import { defaultMintInfo, defaultMintMetadata } from "../../config";

type PaymentButtonProps = {
  className?: string;
  mint?: string;
  currencyPrice?: string;
  mintMetadata?: {
    name: string;
    symbol: string;
    image?: string;
  };
  onSuccess: (payment: Payment) => Promise<void>;
} & Pick<Payment, "description" | "amount">;

export const PaymentButton = ({
  mint,
  description,
  amount,
  currencyPrice,
  mintMetadata = defaultMintMetadata,
  className,
  onSuccess,
}: PaymentButtonProps) => {
  const api = useApi();
  const { connection } = useConnection();
  const { wallets, connected, select, connect, publicKey } = useWallet();
  const [appState, [, app]] = useApp(api, "me");

  const [isProcessing, setIsProcessing] = useState(false);
  const [[mintInfo, payment], setMintInfoAndPayment] = useState<
    [Mint | null, Payment | null]
  >([null, null]);

  const initializePayment = async (): Promise<[Mint, Payment]> => {
    const mintInfo = mint
      ? await getMint(connection, new PublicKey(mint))
      : defaultMintInfo;
    const wallet = app!.wallets.find((wallet) => wallet.chain === "solana")!;

    const payment = await api.payment
      .create({
        wallet: wallet.id,
        mint,
        description,
        customer: publicKey!.toBase58(),
        amount: unsafeBN(
          safeBN(amount as number, mintInfo.decimals).mul(
            new BN(10).pow(new BN(mintInfo.decimals))
          ),
          mintInfo.decimals
        ).toString(),
      })
      .then(({ data }) => ({ ...data, wallet }));

    return [mintInfo, payment];
  };

  return (
    <>
      <button
        disabled={isProcessing}
        className={clsx(className, "bg-black text-white px-4 py-1.5 rounded")}
        onClick={async () => {
          if (appState === "success") {
            if (connected) {
              setIsProcessing(true);
              initializePayment()
                .then(setMintInfoAndPayment)
                .finally(() => setIsProcessing(false));
            } else {
              connect();
              select(wallets.at(0)!.adapter.name);
            }
          }
        }}
      >
        {isProcessing || ["pending", "loading"].includes(appState) ? (
          <Loading />
        ) : (
          <span>Buy</span>
        )}
      </button>
      {app && payment && mintInfo && (
        <PaymentModal
          open={Boolean(app && payment && mintInfo)}
          setOpen={(state) => {
            if (state) setMintInfoAndPayment([mintInfo, payment]);
            else setMintInfoAndPayment([null, null]);
          }}
          app={app}
          currencyPrice={currencyPrice}
          payment={payment}
          mintInfo={mintInfo}
          mintMetadata={mintMetadata}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
};
