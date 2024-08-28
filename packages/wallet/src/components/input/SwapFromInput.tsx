import Image from "next/image";
import { MdExpandMore } from "react-icons/md";

import { IlSOL } from "../../assets";
import clsx from "clsx";

type SwapFromInputProps = {
  className?: string;
};

export default function SwapFromInput({ className }: SwapFromInputProps) {
  return (
    <div
      className={clsx(
        className,
        "flex flex-col bg-black/5 p-2 rounded-t-xl !dark:bg-dark-300/75"
      )}
    >
      <div className="flex items-center space-x-4 p-2 rounded-lg cursor-pointer hover:bg-black/25 dark:hover:bg-black/50">
        <Image
          src={IlSOL.default}
          width={32}
          height={32}
          alt="Solana"
          className="rounded-full"
        />
        <div className="flex-1 flex flex-col">
          <p>Solana</p>
          <p className="text-xs dark:text-white/75">Balance: 0 SOL</p>
        </div>
        <button>
          <MdExpandMore className="text-lg" />
        </button>
      </div>
      <div className="flex items-center px-4">
        <input
          placeholder="0"
          className="flex-1 text-xl pb-2 font-mono"
        />
        <button className="text-sm text-violet-500 dark:text-violet">
          Max
        </button>
      </div>
    </div>
  );
}
