"use client";

import { useEffect } from "react";

export default function ErudaProvider({ children }: React.PropsWithChildren) {
  useEffect(() => {
    import("eruda").then((eruda) => eruda.default.init());
  }, []);

  return children;
}
