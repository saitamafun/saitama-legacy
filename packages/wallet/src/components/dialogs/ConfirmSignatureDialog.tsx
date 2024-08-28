import { Connection } from "@solana/web3.js";

import { useEffect, useState } from "react";
import { MdCheck, MdOutlineError } from "react-icons/md";

import Loading from "../widgets/Loading";
import AlertOverlayDialog from "./AlertOverlayDialog";

type ConfirmSignatureDialogProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  signature: string;
  connection: Connection;
};

export default function ConfirmSignatureDialog({
  open,
  setOpen,
  signature,
  connection,
}: ConfirmSignatureDialogProps) {
  const [status, setStatus] = useState<
    "processing" | "error" | "processed" | "confirmed" | "finalized"
  >("processing");
  const [confirmations, setConfirmations] = useState<number | null>(0);

  useEffect(() => {
    const subId = connection.onSignatureWithOptions(
      signature,
      async (options) => {
        if ("result" in options && options.result.err)
          return setStatus("error");

        const { value } = await connection.getSignatureStatus(signature);
        if (value) {
          if (value.err) return setStatus("error");
          if (value.confirmationStatus) setStatus(value.confirmationStatus);
          setConfirmations(value.confirmations);
        }
      }
    );

    return () => {
      connection.removeSignatureListener(subId);
    };
  }, [signature, confirmations, setStatus, setConfirmations]);

  return (
    <AlertOverlayDialog
      open={open}
      setOpen={setOpen}
    >
      <section className="flex-1 flex flex-col">
        <div className="m-auto flex flex-col space-y-4 text-center">
          <div className="self-center flex flex-col space-y-2">
            {status === "error" ? (
              <>
                <div className="self-center p-3 bg-red-100 rounded-full">
                  <MdOutlineError className="text-red text-4xl" />
                </div>
                <p className="text-lg">Transaction Failed</p>
              </>
            ) : status === "finalized" ? (
              <>
                <div className="self-center p-3 bg-green dark:bg-green/10 rounded-full">
                  <MdCheck className="text-white text-4xl dark:text-green" />
                </div>
                <div>
                  <p className="text-lg capitalize">Transaction {status}</p>
                  <div className="text-sm text-black/75 dark:text-white/75">
                    Maximum confirmations
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="self-center p-4  bg-black rounded-full dark:bg-white">
                  <Loading inverted />
                </div>
                <div>
                  <p className="text-lg capitalize">Transaction {status}</p>
                  <div className="text-sm text-black/75 dark:text-white/75">
                    {confirmations}/31 confirmations
                  </div>
                </div>
              </>
            )}
          </div>
          <a className="text-violet-500 dark:text-violet">View Transaction</a>
        </div>
      </section>
      <footer className="flex flex-col py-4">
        <button
          className="btn btn-secondary p-3"
          onClick={() => {
            if (setOpen) setOpen(false);
          }}
        >
          Close
        </button>
      </footer>
    </AlertOverlayDialog>
  );
}
