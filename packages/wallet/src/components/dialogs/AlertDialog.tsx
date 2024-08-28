"use client";
import clsx from "clsx";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { MdClose } from "react-icons/md";

type AlertDialogProps = {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
} & React.PropsWithChildren;

const closeWindow = (open: boolean) => {
  if (!open) {
    const message = {
      event: "modal",
      data: { open },
    };

    window.parent.postMessage(message, "*");
  }
};

export default function AlertDialog({
  open = true,
  setOpen,
  title,
  actions,
  className,
  children,
}: AlertDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={() => {
        if (setOpen) setOpen(false);
      }}
      className="relative font-sans text-sm z-50"
    >
      <DialogBackdrop className="fixed inset-0 bg-black/10 backdrop-blur-md dark:bg-white/10" />
      <div className="fixed inset-0 flex flex-col">
        <DialogPanel
          className={clsx([
            "relative mt-auto min-h-lg flex flex-col  space-y-4 bg-white px-4 rounded-t-xl  overflow-y-hidden  dark:bg-dark-700 dark:text-white md:m-auto md:w-sm md:rounded-b-xl ",
            className,
          ])}
        >
          <header className="flex items-center py-4 sticky top-0 bg-white dark:bg-dark-700">
            <button
              className="p-2 rounded-full  bg-black/5  dark:bg-white/10"
              onClick={() => (setOpen ? setOpen(false) : closeWindow(false))}
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
          <div id="dialog__panel" />
        </DialogPanel>
      </div>
    </Dialog>
  );
}
