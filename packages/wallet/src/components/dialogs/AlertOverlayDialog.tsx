"use client";
import clsx from "clsx";
import { MdClose } from "react-icons/md";
import { createPortal } from "react-dom";

import { DialogTitle } from "@headlessui/react";

type AlertOverlayDialogProps = {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
} & React.PropsWithChildren;

export default function AlertOverlayDialog({
  open,
  setOpen,
  title,
  actions,
  className,
  children,
}: AlertOverlayDialogProps) {
  return (
    open &&
    createPortal(
      <div className="self-center absolute inset-0 flex flex-col z-100  bg-black/50 animate-fade-in animate-duration-150">
        <div
          className={clsx([
            "mt-auto  min-h-xl flex flex-col  space-y-4 bg-white px-4 rounded-t-xl animate-slide-in-up animate-duration-150  dark:bg-dark-700 dark:text-white",
            className,
          ])}
        >
          <header className="flex items-center py-4 sticky top-0 bg-white dark:bg-dark-700 z-100">
            <button
              className="p-2 rounded-full  bg-black/5  dark:bg-white/10"
              onClick={() => setOpen(false)}
            >
              <MdClose className="text-black/50 dark:text-white" />
            </button>
            {title && (
              <DialogTitle className="flex-1 flex items-center justify-center text-center space-x-2">
                {title}
              </DialogTitle>
            )}
            {actions}
          </header>
          <main className="flex-1 flex flex-col">{children}</main>
        </div>
      </div>,
      document.querySelector("#dialog__panel")!
    )
  );
}
