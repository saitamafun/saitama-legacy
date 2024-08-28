import moment from "moment";
import { useState } from "react";
import { type Id, toast, ToastContainer } from "react-toastify";
import type { Mint } from "@solana/spl-token";
import { SolanaPayment, type App, type Payment } from "@saitamafun/sdk";

import { MdCheck, MdClose, MdOutlineOpenInNew } from "react-icons/md";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";

import { Loading } from "../Loading";
import { Explorer, toUIAmount } from "../../lib/web3";
import { useApi } from "../../composables";
import TransactionToast from "../TransactionToast";
import { useProgram } from "../../composables/useProgram";

import "./PaymentModal.style.css";

type PaymentModalProps = {
  app: App;
  payment: Payment;
  currencyPrice?: string;
  open: boolean;
  mintInfo: Mint;
  mintMetadata: { name: string; symbol: string; image?: string | null };
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess: (payment: Payment) => void;
};

export const PaymentModal = ({
  app,
  payment,
  currencyPrice,
  open,
  mintInfo,
  mintMetadata,
  setOpen,
  onSuccess,
}: PaymentModalProps) => {
  const api = useApi();
  const program = useProgram();

  const [isSuccessful, setIsSucessful] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastId, setToastId] = useState<Id | null>(null);
  const [processResult, setProcessResult] = useState<Payment | null>(null);

  const processPayment = () => {
    const sdk = new SolanaPayment(program, api);

    return sdk.initializePayment(payment, !payment.mint);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        className="relative  md:w-lg md:self-end z-50"
      >
        <DialogBackdrop className="fixed inset-0 flex flex-col bg-black/30" />
        <div className="fixed inset-0 flex flex-col md:items-center  ">
          <div className="flex-1 flex flex-col md:w-lg md:self-end">
            <DialogPanel className="m-auto w-xs h-sm flex flex-col space-y-8 bg-white rounded-md p-2">
              <header className="flex items-center">
                <button
                  className="p-2"
                  onClick={() => {
                    if (processResult) onSuccess(processResult);
                    setOpen(false);
                  }}
                >
                  <MdClose className="text-xl text-black/75" />
                </button>
                <div className="flex-1 flex items-center justify-center">
                  <h1 className="text-center text-lg">Confirmation</h1>
                </div>
              </header>
              <div className="flex-1 flex flex-col  space-y-4 text-center">
                <div className="flex flex-col space-y-2  justify-center items-center">
                  {isSuccessful ? (
                    <div className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full">
                      <MdCheck className="text-2xl" />
                    </div>
                  ) : app.logo ? (
                    <img
                      src={app.logo}
                      width={32}
                      height={32}
                      alt="Saitama"
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center bg-black/10 rounded-full">
                      <span className="text-xl font-bold">
                        {app.name.at(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col space-y-2">
                    <h1 className="text-lg font-medium">
                      {isSuccessful
                        ? "Payment Successful"
                        : payment.description}
                    </h1>
                    <div className="flex flex-col">
                      <small className="text-xs text-black/50 uppercase">
                        {payment.id}
                      </small>
                      <small className="text-green-500">
                        {moment(payment.createdAt).format(
                          "MMMM Do YYYY, h:mm a"
                        )}
                      </small>
                    </div>
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold">
                    {toUIAmount(
                      payment.amount as string,
                      mintInfo.decimals
                    ).toFixed(2)}{" "}
                    {mintMetadata.symbol}
                  </h1>
                  {currencyPrice && (
                    <p className="text-black/50 text-base">{currencyPrice}</p>
                  )}
                </div>
              </div>
              {isSuccessful ? (
                <a
                  target="_blank"
                  href={Explorer.buildTx(processResult!.signature!)}
                  className="bofoi__btn !px-4"
                >
                  <p className="flex-1">Open in explorer</p>
                  <MdOutlineOpenInNew className="text-xl" />
                </a>
              ) : (
                <button
                  disabled={isProcessing}
                  className="bofoi__btn"
                  onClick={async () => {
                    setIsProcessing(true);
                    const toastId = toast.loading("Processing transaction...", {
                      autoClose: false,
                    });
                    setToastId(toastId);

                    processPayment()
                      .then(setProcessResult)
                      .catch((error) => {
                        toast.update(toastId, {
                          render: "Oops! Transaction failed",
                          autoClose: 5000,
                          type: "error",
                          isLoading: false,
                        });

                        setIsProcessing(false);

                        return Promise.reject(error);
                      });
                  }}
                >
                  {isProcessing ? <Loading /> : "Pay"}
                </button>
              )}
            </DialogPanel>
          </div>
        </div>
      </Dialog>
      {toastId && processResult?.signature && (
        <TransactionToast
          toastId={toastId}
          signature={processResult.signature}
          callback={(status) => {
            switch (status) {
              case "finalized":
                setIsProcessing(false);
                setIsSucessful(true);
                onSuccess(processResult);
                break;
            }
          }}
        />
      )}
      <ToastContainer className="z-9999" />
    </>
  );
};
