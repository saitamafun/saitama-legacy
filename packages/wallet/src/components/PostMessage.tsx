import { Connection, Message, Transaction } from "@solana/web3.js";

import { useEffect, useState } from "react";

import { useExma, useWallet } from "../composables";

import { sendMessage } from "../lib/web3/utils";
import {
  legacyTransactionToV0Transaction,
  simulateTransaction,
  type PreEvent,
} from "../lib";

import Loading from "./widgets/Loading";
import {
  ApproveTransactionDialog,
  FundDialog,
  SelectTokenDialog,
} from "./dialogs";

export default function PostMessage() {
  const { api } = useExma();
  const { wallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [child, setChild] = useState<React.ReactNode>(null);

  const setOpen = (value: React.SetStateAction<boolean>) => {
    const open = typeof value === "function" ? value(false) : value;
    if (open) return;
    sendMessage("modal", { open });
  };

  const processMessage = async (data: PreEvent.Event) => {
    switch (data.event) {
      case "transaction.approve":
        const { message, rpcEndpoint } = data.data;
        const connection = new Connection(rpcEndpoint);
        const legacyTransaction = Transaction.populate(Message.from(message));

        const v0Transaction = await legacyTransactionToV0Transaction(
          connection,
          legacyTransaction
        );
        const stimulationResult = await simulateTransaction(
          api,
          connection,
          v0Transaction,
          wallet.publicKey
        );

        setChild(
          <ApproveTransactionDialog
            open={true}
            transaction={v0Transaction}
            legacyTransaction={legacyTransaction}
            simulationResult={stimulationResult}
            setOpen={setOpen}
            onResult={(error, signature) =>
              sendMessage("transaction", { error, signature }, data.id)
            }
          />
        );
        break;
      case "select.mint":
        setChild(
          <SelectTokenDialog
            setOpen={setOpen}
            onSelect={(portofolio) => {
              if (portofolio) sendMessage("select.mint", portofolio, data.id);
            }}
            open
          />
        );
        break;
      case "wallet.fund":
        setChild(
          <FundDialog
            address={wallet.publicKey.toBase58()}
            setOpen={setOpen}
            open
          />
        );
    }
  };

  const onMessage = ({ data }: MessageEvent<PreEvent.Event>) => {
    setLoading(true);
    processMessage(data).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (wallet) {
      sendMessage("wallet", {
        status: "connected",
        publicKey: wallet.publicKey.toBase58(),
      });
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [wallet]);

  return loading ? (
    <div className="absolute inset-0 flex flex-col bg-black/50 backdrop-blur-sm">
      <Loading />
    </div>
  ) : (
    child
  );
}
