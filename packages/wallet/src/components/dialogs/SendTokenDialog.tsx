"use client";

import clsx from "clsx";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import type { DigitalAssetWithToken } from "@metaplex-foundation/mpl-token-metadata";

import { ErrorMessage, Field, Form, Formik } from "formik";

import { useState } from "react";
import { GoMention } from "react-icons/go";

import { useWallet, useExma } from "../../composables";
import { useJsonMetadata } from "../../composables/useJsonMetadata";
import {
  processSendTokenForm,
  sendTokenValidationSchema,
} from "../../forms/SendTokenForm";
import {
  legacyTransactionToV0Transaction,
  simulateTransaction,
} from "../../lib/web3/transaction";

import Loading from "../widgets/Loading";
import AlertOverlayDialog from "./AlertOverlayDialog";
import ConfirmSignatureDialog from "./ConfirmSignatureDialog";
import { ApproveTransactionDialog } from "./ApproveTransactionDialog";

type SendTokenDialogProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  digitalAssetWithToken: DigitalAssetWithToken;
};

export default function SendTokenDialog({
  digitalAssetWithToken,
  open,
  setOpen,
}: SendTokenDialogProps) {
  const { mint, metadata, token } = digitalAssetWithToken;
  const jsonMetadata = useJsonMetadata(metadata.uri, mint.publicKey);

  const { api } = useExma();
  const { connection, wallet } = useWallet();

  const [signature, setSignature] = useState<string | null>(null);
  const [transactionProps, setTransactionProps] = useState<{
    transaction: VersionedTransaction;
    legacyTransaction: Transaction;
    simulationResult: Awaited<ReturnType<typeof simulateTransaction>>;
  } | null>(null);

  return (
    <>
      <AlertOverlayDialog
        open={open}
        setOpen={setOpen}
        title={
          <>
            {jsonMetadata && jsonMetadata.image && (
              <img
                src={jsonMetadata.image}
                className="w-6 h-6 rounded-full"
              />
            )}
            <p>Send {metadata.name}</p>
          </>
        }
      >
        <Formik
          initialValues={{ address: "", amount: "" }}
          validationSchema={sendTokenValidationSchema}
          onSubmit={(values, { setSubmitting }) => {
            return processSendTokenForm(
              connection,
              wallet,
              Object.assign(token, mint),
              values
            )
              .then(async (legacyTransaction) => {
                const transaction = await legacyTransactionToV0Transaction(
                  connection,
                  legacyTransaction
                );
                const simulationResult = await simulateTransaction(
                  api,
                  connection,
                  transaction,
                  new PublicKey(wallet.publicKey)
                );

                setTransactionProps({
                  legacyTransaction,
                  transaction,
                  simulationResult,
                });
              })
              .finally(() => setSubmitting(false));
          }}
        >
          {({ errors, isSubmitting }) => (
            <Form
              className="flex-1 flex flex-col"
              autoComplete="off"
            >
              <div className="flex-1 flex flex-col space-y-2">
                <div>
                  <div
                    className={clsx(
                      "flex items-center space-x-2   bg-black/5 px-2 border border-black/5  rounded-md input dark:bg-dark-500 dark:border-dark-300",
                      { "!border !border-red": errors.address }
                    )}
                  >
                    <Field
                      name="address"
                      className="flex-1 bg-transparent placeholder-text-black/50 py-3 focus:outline-none dark:placeholder:text-white/75"
                      placeholder="Recipient's Solana address"
                    />
                    <div className="bg-black  p-2 rounded-full dark:bg-white">
                      <GoMention className="!text-white dark:!text-black" />
                    </div>
                  </div>
                  <small className="text-xs text-red capitalize">
                    <ErrorMessage name="address" />
                  </small>
                </div>
                <div>
                  <div
                    className={clsx(
                      "flex items-center space-x-2   bg-black/5 px-2 border border-black/5  rounded-md input dark:bg-dark-500 dark:border-dark-300",
                      { "!border !border-red": errors.amount }
                    )}
                  >
                    <Field
                      name="amount"
                      className="flex-1 bg-transparent placeholder-text-black/50 py-3 focus:outline-none dark:placeholder:text-white/75"
                      placeholder="Amount"
                      type="number|tel"
                      step="any"
                    />
                    <div className="flex items-center space-x-2">
                      <p className="uppercase">{metadata.symbol}</p>
                      <button
                        type="button"
                        className="text-xs bg-black text-white  px-2 py-1 rounded-full dark:bg-dark-100"
                      >
                        Max
                      </button>
                    </div>
                  </div>
                  <small className="text-xs text-red capitalize">
                    <ErrorMessage name="amount" />
                  </small>
                </div>
              </div>
              <div className="flex space-x-4 py-4">
                <button
                  type="submit"
                  className="flex-1 btn btn-secondary p-3"
                  onClick={() => {
                    if (setOpen) setOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmitting}
                  className="flex-1 btn btn-primary p-3"
                >
                  {isSubmitting ? (
                    <Loading className="!border-white !border-t-transparent dark:!border-black dark:!border-t-transparent" />
                  ) : (
                    "Next"
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </AlertOverlayDialog>
      {transactionProps && (
        <ApproveTransactionDialog
          {...transactionProps}
          open={Boolean(transactionProps)}
          setOpen={(open) => (open ? undefined : setTransactionProps(null))}
          onResult={(error, signature) => {
            if (error) return;
            else setSignature(signature);
          }}
        />
      )}
      {signature && (
        <ConfirmSignatureDialog
          connection={connection}
          signature={signature}
          open={Boolean(signature)}
          setOpen={(value) => {
            value ? undefined : setSignature(null);
            if (setOpen) setOpen(false);
            setTransactionProps(null);
          }}
        />
      )}
    </>
  );
}
