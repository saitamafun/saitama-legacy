import { MdArrowDownward } from "react-icons/md";
import SwapFromInput from "../input/SwapFromInput";
import SwapToInput from "../input/SwapToInput";
import AlertOverlayDialog from "./AlertOverlayDialog";

type SwapTokenDialogProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function SwapTokenDialog({
  open,
  setOpen,
}: SwapTokenDialogProps) {
  return (
    <AlertOverlayDialog
      open={open}
      setOpen={setOpen}
      title="Swap Token"
    >
      <section>
        <div className="relative flex flex-col items-center justify-center space-y-0.5">
          <SwapFromInput className="w-full" />
          <div className="my-auto flex absolute inset-x-0">
            <button className="m-auto bg-black text-white p-2 rounded-full dark:bg-white dark:text-black">
              <MdArrowDownward className="text-xl" />
            </button>
          </div>
          <SwapToInput className="w-full" />
        </div>
      </section>
    </AlertOverlayDialog>
  );
}
