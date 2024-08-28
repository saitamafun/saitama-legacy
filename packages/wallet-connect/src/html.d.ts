import type { AttributifyAttributes } from "@unocss/preset-attributify";

interface ClassName {
  className?: string;
}

declare module "react" {
  interface HTMLAttributes<T> extends AttributifyAttributes {}
  interface React extends ClassName {}
}
