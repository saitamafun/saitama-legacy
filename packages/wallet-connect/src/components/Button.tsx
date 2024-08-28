"use client";

import { forwardRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Popover, PopoverButton, MenuButton, Menu } from "@headlessui/react";

import Modal from "./Modal";
import WalletPopover from "./Popover";
import { truncateAddress } from "../utils";

type WalletConnectButtonProps = {
  className?: string;
  onClose?: () => void;
};

export const WalletConnectButton = forwardRef<
  HTMLButtonElement,
  WalletConnectButtonProps
>(function WalletConnectButton({ className }, ref) {
  const { publicKey, connected, wallet } = useWallet();
  let Button = connected ? MenuButton : PopoverButton;

  return (
    <Popover>
      <Menu
        as="div"
        className="relative"
      >
        <Button
          ref={ref}
          className={[
            "!btn !btn-primary flex truncate outline-none space-x-2 rounded",
            className ?? "",
          ].join(" ")}
        >
          {wallet && publicKey ? (
            <>
              <img
                src={wallet.adapter.icon}
                alt={wallet.adapter.name}
                width={24}
                height={24}
              />
              {publicKey && (
                <span>{truncateAddress(publicKey.toBase58())}</span>
              )}
            </>
          ) : (
            <>
              Connect&nbsp;<span className="lt-md:hidden"> Wallet</span>
            </>
          )}
        </Button>
        {connected && <WalletPopover />}
      </Menu>
      {!connected && <Modal />}
    </Popover>
  );
});
