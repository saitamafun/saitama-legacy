import { MenuItems, MenuItem } from "@headlessui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { MdAccountCircle, MdLogout } from "react-icons/md";

import { truncateAddress } from "../utils";

export default function WalletPopover() {
  const { disconnect, publicKey } = useWallet();

  return (
    <MenuItems
      as="div"
      className="absolute right-0 mt-2 w-56 flex flex-col rounded bg-white text-black shadow p-2 outline-none backdrop-blur-3xl"
    >
      <MenuItem
        as="a"
        href={`/profile?address=${publicKey?.toBase58()}`}
        className="flex items-center p-2 text-black/75 space-x-2 hover:text-black"
      >
        <MdAccountCircle className="text-xl" />
        <span>Edit Profile</span>
      </MenuItem>
      <MenuItem
        as="button"
        className="flex p-2 text-black/75 space-x-2 hover:text-black"
        onClick={disconnect}
      >
        <MdLogout className="text-xl" />
        <div className="flex flex-col">
          <span>Disconnect</span>
          <small className="text-xs text-black/50">
            {truncateAddress(publicKey!.toBase58())}
          </small>
        </div>
      </MenuItem>
    </MenuItems>
  );
}
