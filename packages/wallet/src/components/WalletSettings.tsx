import { MdQuestionMark, MdSettings } from "react-icons/md";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

import SaitamaIcon from "../assets/SaitamaIcon";

export default function WalletSettings() {
  return (
    <Menu
      as="div"
    >
      <MenuButton>
        <MdSettings className="text-2xl text-black/75 dark:text-white/75" />
      </MenuButton>
      <MenuItems className="w-48 absolute right-0 flex flex-col bg-dark-300 p-2 rounded-md">
        <MenuItem
          as="button"
          className="flex items-center space-x-4 p-2 hover:bg-black/50 hover:rounded-md"
        >
          <MdQuestionMark />
          <span className="shrink-0 text-xs">Help & Support</span>
        </MenuItem>
        <MenuItem
          as="button"
          className="flex items-center space-x-4 p-2 hover:bg-black/50 hover:rounded-md"
        >
          <SaitamaIcon className="w-4 h-4" />
          <span className="shrink-0 text-xs">About Saitama</span>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
