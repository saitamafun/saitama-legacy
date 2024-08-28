"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";

import { useEffect } from "react";
import { MdCode } from "react-icons/md";

import { sendMessage } from "@saitamafun/wallet";

type ErrorMessageProps = {
  title?: string;
  className?: string;
  message: string;
  description?: React.ReactNode;
};

export default function ErrorMessage({
  className,
  message,
  title = "Oops, an unexpected error occur!",
  description = "Try reloading page, if problem persite contact support.",
}: ErrorMessageProps) {
  const router = useRouter();

  useEffect(() => {
    sendMessage("wallet.error", { message });
  }, [title, description]);

  return (
    <div
      className={clsx(
        className,
        "flex flex-col items-center justify-center space-y-4"
      )}
    >
      <div className="flex w-10 h-10 rounded-full bg-black dark:bg-white">
        <MdCode className="m-auto text-xl text-white dark:text-black" />
      </div>
      <div className="flex flex-col">
        <h1 className="text-xl font-bold">{title}</h1>
        <div className="text-sm text-black/75 dark:text-white/75">
          {description}
        </div>
      </div>
      <button
        className="btn-custom"
        onClick={() => router.refresh()}
      >
        Refresh
      </button>
    </div>
  );
}
