import { useWallet } from "@solana/wallet-adapter-react";

import { MdWallet } from "react-icons/md";
import { PopoverPanel } from "@headlessui/react";

export default function WalletModal() {
  const { wallets, select } = useWallet();

  return (
    <PopoverPanel
      className="absolute right-1/18 z-10 h-1/2 w-3/4 overflow-y-scroll rounded bg-white text-black shadow border text-black px-2 py-4 backdrop-blur-xl"
      md="right-2 w-1/3"
      xl="w-1/4"
    >
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <div className="items-center rounded bg-violet-700 text-white p-2 text-black">
            <MdWallet className="text-2xl" />
          </div>
          <div className="flex-1">
            <h1 className="text-primary font-bold md:text-xl">
              Connect Wallet
            </h1>
            <p className="text-sm text-black/75">
              Choose the wallet you want to connect
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {wallets.map((wallet, index) => (
            <button
              key={index}
              className="flex items-center border-1 border-transparent rounded bg-black/5 p-3 space-x-4 hover:border-violet-700 hover:bg-violet-700/20"
              onClick={() => select(wallet.adapter.name)}
            >
              <div>
                <img
                  src={wallet.adapter.icon}
                  width={32}
                  height={32}
                  alt={wallet.adapter.name}
                />
              </div>
              <div>
                <p>{wallet.adapter.name}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </PopoverPanel>
  );
}
