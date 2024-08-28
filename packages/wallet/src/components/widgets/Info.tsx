import clsx from "clsx";
import { MdInfoOutline } from "react-icons/md";

type InfoProps = {
  text: string;
  className?: string;
};

export default function Info({ text, className }: InfoProps) {
  return (
    <div
      className={clsx(
        "flex-inline items-center space-x-2  bg-violet-50 p-2 rounded dark:bg-dark-300/50",
        className
      )}
    >
      <div>
        <MdInfoOutline className="text-lg text-violet-500 dark:text-violet-300" />
      </div>

      <p className="text-xs dark:text-violet-100">{text}</p>
    </div>
  );
}
