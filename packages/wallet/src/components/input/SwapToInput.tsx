import Image from "next/image";
import { IlUSDC } from "../../assets";
import { MdExpandMore } from "react-icons/md";
import clsx from "clsx";

type SwapToInputProps = {
  className?: string;
};

export default function SwapToInput({ className }: SwapToInputProps) {
  return (
    <div
      className={clsx(
        className,
        "flex flex-col  bg-black/5 p-2 rounded-b-xl !dark:bg-dark-300/75"
      )}
    >
      <div className="flex items-center space-x-4 p-2 rounded-lg cursor-pointer hover:bg-black/25 dark:hover:bg-black/50">
        <Image
          src={IlUSDC.default}
          width={32}
          height={32}
          alt="Solana"
          className="rounded-full"
        />
        <div className="flex-1 flex flex-col">
          <p className="font-medium">USD Coin</p>
          <p className="text-xs text-black/75 dark:text-white/75">USDC</p>
        </div>
        <button>
          <MdExpandMore className="text-lg" />
        </button>
      </div>
      <div className="flex items-center px-4">
        <input
          placeholder="0"
          className="flex-1 pb-2 text-xl font-mono"
        />
        <p className="text-stone !dark:text-stone-500">$0</p>
      </div>
    </div>
  );
}
