"use client";

import { useEffect } from "react";
import { DEBUG } from "../config";

export default function ErudaProvider({ children }: React.PropsWithChildren) {
  useEffect(() => {
    if (DEBUG) import("eruda").then((eruda) => eruda.default.init());
  }, []);

  return children;
}
