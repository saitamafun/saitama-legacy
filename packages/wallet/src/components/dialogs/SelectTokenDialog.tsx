"use client";

import { MdSearch } from "react-icons/md";
import type { DigitalAssetWithToken } from "@metaplex-foundation/mpl-token-metadata";

import { useWallet } from "../../composables";

import WalletTokenList, { WalletTokenListSkeleton } from "../WalletTokenList";

import AlertOverlayDialog from "./AlertOverlayDialog";

type SelectTokenDialogProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSelect: React.Dispatch<DigitalAssetWithToken | null>;
};

export function SelectTokenDialog({
  open,
  setOpen,
  onSelect,
}: SelectTokenDialogProps) {
  const { portfolio } = useWallet();

  return (
    <AlertOverlayDialog
      open={open}
      setOpen={setOpen}
      title="Choose a token"
      className="overflow-y-scroll"
    >
      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex items-center space-x-2 border border-black/5 bg-black/5 px-2 rounded input dark:border dark:border-dark-300 dark:bg-black">
          <MdSearch className="text-xl text-black/75 dark:text-white/75" />
          <input
            className="flex-1 bg-transparent py-3 placeholder:text-black/75 focus:outline-none dark:placeholder:text-white/75"
            placeholder="Search for a token"
          />
        </div>
        <section className="flex-1 flex flex-col space-y-2">
          {portfolio?.data ? (
            <WalletTokenList
              digitalAssetsWithTokens={portfolio.data}
              onSelect={onSelect}
              className="bg-black/5  rounded-md dark:bg-dark-300/50"
            />
          ) : (
            <WalletTokenListSkeleton length={8} />
          )}
        </section>
      </div>
    </AlertOverlayDialog>
  );
}
