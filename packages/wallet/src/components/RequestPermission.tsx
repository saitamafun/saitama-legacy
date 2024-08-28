"use client";

import { useEffect, useState } from "react";
import { MdLock } from "react-icons/md";

import { usePermission } from "../composables";
import Loading from "./widgets/Loading";
import { sendMessage } from "../lib";

export function RequestPermission() {
  const [isLoading, setIsLoading] = useState(false);
  const { setPermission } = usePermission();

  useEffect(() => {
    sendMessage("wallet", { status: "authenticating", publicKey: undefined });
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center  dark:bg-dark dark:text-white">
      <div className="w-xs flex-1 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-10 h-10 flex items-center justify-center bg-black text-white rounded-full dark:bg-white dark:text-black ">
          <MdLock className="text-xl" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Grant Permission</h1>
          <p className="text-sm text-black/75 dark:text-white/75">
            For cookies and site to work properly, we need access to top level
            storage access.
          </p>
        </div>
      </div>
      <div className="w-xs flex flex-col p-4">
        <button
          className="btn btn-primary py-2 px-8"
          onClick={() => {
            setIsLoading(true);
            setPermission().finally(() => setIsLoading(false));
          }}
        >
          {isLoading ? <Loading /> : <span>Confirm</span>}
        </button>
      </div>
    </div>
  );
}
