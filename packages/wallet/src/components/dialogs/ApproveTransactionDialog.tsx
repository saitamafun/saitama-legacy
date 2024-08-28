"use client";

import BN from "bn.js";
import clsx from "clsx";
import { XiorError } from "xior";

import { safeBN, unsafeBnToNumber } from "@solocker/safe-bn";
import {
  LAMPORTS_PER_SOL,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";

import { useMemo, useState } from "react";
import { MdCheckCircle, MdInfo } from "react-icons/md";

import { processTransaction } from "../../actions";
import { useExma, useWallet } from "../../composables";
import { truncateAddress } from "../../lib/web3/utils";
import type { simulateTransaction } from "../../lib/web3/transaction";

import Loading from "../widgets/Loading";
import AlertOverlayDialog from "./AlertOverlayDialog";
import usePolyfillCookie from "../../composables/usePolyfillCookie";

type ApproveTransactionDialogProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  legacyTransaction: Transaction;
  transaction: VersionedTransaction;
  simulationResult: Awaited<ReturnType<typeof simulateTransaction>>;
  onResult: (err: Error | null, signature: string | null) => any;
};

export function ApproveTransactionDialog({
  open,
  setOpen,
  legacyTransaction,
  onResult,
  transaction,
  simulationResult,
}: ApproveTransactionDialogProps) {
  const { authUserApi } = useExma();
  const [cookies] = usePolyfillCookie(["accessToken"]);
  const { wallet, connection } = useWallet();

  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  const disable = useMemo(
    () => isSuccess || isSubmitting,
    [isSuccess, isSubmitting]
  );

  const sendTransaction = () => {
    setSubmitting(true);

    return processTransaction(
      wallet.id,
      Array.from(legacyTransaction.serializeMessage()),
      [],
      connection.rpcEndpoint,
      authUserApi.baseURL,
      authUserApi.token ?? cookies.accessToken
    )
      .then((result) => {
        setIsSuccess(true);
        onResult(null, result);
      })
      .catch((error) => {
        if (error instanceof XiorError)
          return Promise.reject(onResult(error.response?.data, null));

        onResult(error, null);
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <AlertOverlayDialog
      open={open}
      setOpen={setOpen}
      title="Approve Transaction"
      className="overflow-x-hidden overflow-y-scroll"
    >
      <section className="flex-1 flex flex-col space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex flex-col bg-black/2 shadow rounded-md dark:bg-dark-300/50 dark:shadow-dark-400">
            <div className="px-4 py-3 shadow-sm dark:shadow-dark-400">
              <h2 className="font-medium">Estimated Balance Changes</h2>
            </div>
            <div className="flex flex-col">
              {simulationResult.accounts.map((account) => {
                const decimals = account.digitalAsset.mint.decimals;

                const amount = new BN(
                  (account.preBalance > account.postBalance
                    ? account.preBalance - account.postBalance
                    : account.postBalance - account.preBalance
                  ).toString()
                );

                const uiAmount = unsafeBnToNumber(
                  safeBN(amount, decimals).div(
                    new BN(10).pow(new BN(decimals))
                  ),
                  decimals
                );

                const isDeducted = account.preBalance > account.postBalance;

                return (
                  <div
                    key={account.mint.toBase58()}
                    className="flex px-4 py-2"
                  >
                    <p className="flex-1 text-black/75 dark:text-white/75">
                      {account.digitalAsset.metadata.name}
                    </p>
                    <p
                      className={clsx(
                        "font-mono text-xs font-medium",
                        isDeducted
                          ? "text-red-500 "
                          : "text-green-500 before:content-['+']"
                      )}
                    >
                      {uiAmount} {account.digitalAsset.metadata.symbol}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          {simulationResult.fee && (
            <div className="flex bg-black/2 p-3 rounded-md shadow dark:bg-dark-300/50 dark:shadow-dark-400">
              <div className="flex-1 flex items-center space-x-2">
                <MdInfo className="text-lg text-black/50 dark:text-white/50" />
                <p className="text-black/75 dark:text-white/75">Network Fee</p>
              </div>
              <p className="font-mono text-xs">
                {simulationResult.fee / LAMPORTS_PER_SOL} SOL
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-col space-y-4">
          <p>Advance</p>
          <div className="flex-1 flex flex-col space-y-2">
            {transaction.message.compiledInstructions.map(
              (instruction, index) => {
                const programId =
                  transaction.message.staticAccountKeys[
                    instruction.programIdIndex
                  ];
                const data = Buffer.from(instruction.data).toString("base64");

                return (
                  <div
                    key={index}
                    className="bg-black/2 rounded-md shadow dark:shadow-dark-300 dark:bg-dark-300/50 "
                  >
                    <div className="px-4 py-3 shadow-sm dark:shadow-dark-300">
                      <p>Unknown</p>
                    </div>
                    <div className="flex flex-col px-2">
                      <div className="flex items-center p-2">
                        <p className="flex-1 text-black/75 dark:text-white/75">
                          Program Id
                        </p>
                        <p className="text-violet-700 dark:text-violet text-xs">
                          {truncateAddress(programId.toBase58())}
                        </p>
                      </div>
                      <div className="flex items-center p-2">
                        <p className="flex-1 text-black/75 dark:text-white/75">
                          Data
                        </p>
                        <p className="text-xs">{data}</p>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </section>
      <div className="flex space-x-2 py-4 sticky bottom-0 bg-white dark:bg-dark-700">
        <button
          type="button"
          className="flex-1 btn-secondary p-3"
          onClick={() => {
            if (setOpen) setOpen(false);
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={disable}
          className="flex-1 btn btn-primary p-3 disabled:opacity-50"
          onClick={sendTransaction}
        >
          {isSubmitting ? (
            <Loading inverted />
          ) : isSuccess ? (
            <MdCheckCircle className="text-lg text-green-100 dark:text-green" />
          ) : (
            "Approve"
          )}
        </button>
      </div>
    </AlertOverlayDialog>
  );
}
