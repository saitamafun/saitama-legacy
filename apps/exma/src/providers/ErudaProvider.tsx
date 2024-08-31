"use client";

import eruda from "eruda";
import { useEffect } from "react";

export default function ErudaProvider({ children }: React.PropsWithChildren) {
  useEffect(() => eruda.init(), []);

  return children;
}
