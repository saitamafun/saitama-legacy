"use client";

import { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";

import { truncateAddress } from "../../lib/web3/utils";
import { useMedia } from "../../composables/useMedia";

import Info from "../widgets/Info";
import QRCode from "../widgets/QRCode";
import AlertOverlayDialog from "./AlertOverlayDialog";

type FundDialogProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  address: string;
};

export function FundDialog({ open, setOpen, address }: FundDialogProps) {
  const { is } = useMedia();
  const [isCopied, setIsCopied] = useState(false);

  return (
    <AlertOverlayDialog
      open={open}
      setOpen={setOpen}
      title="Fund Wallet"
      className="!h-auto !w-auto px-4"
    >
      <section className="flex-1  flex flex-col space-y-4 pb-4">
        <Info
          text="
            Send funds directly to your wallet by copying your wallet address or
            scanning a QR code."
        />
        <div className="flex-1 flex flex-col space-y-4">
          <div className="m-auto w-xs flex flex-col items-center justify-center  bg-black5 p-2 rounded-md">
            <QRCode
              width={256}
              height={256}
              data={address}
              dotsOptions={{
                type: "extra-rounded",
                color: is("dark") ? "rgba(255,255,255,0.9)" : "#000000",
              }}
              backgroundOptions={{ color: "transparent" }}
              cornersDotOptions={{
                type: "dot",
              }}
              cornersSquareOptions={{
                type: "extra-rounded",
              }}
            />
          </div>
        </div>
        <div className="self-center w-full flex items-center bg-black/5 px-4 py-3 rounded-md dark:bg-violet-50/5">
          <div className="flex-1">
            <p className="text-xs text-black/75 dark:text-white/75">
              Wallet address
            </p>
            <p className="font-medium">{truncateAddress(address)}</p>
          </div>
          <CopyToClipboard
            text={address}
            onCopy={() => setIsCopied(true)}
          >
            <button className="text-xs font-medium bg-black text-white px-4 py-2 rounded dark:bg-white dark:text-black">
              {isCopied ? "Copied" : "Copy"}
            </button>
          </CopyToClipboard>
        </div>
      </section>
    </AlertOverlayDialog>
  );
}
