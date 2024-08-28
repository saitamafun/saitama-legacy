import { useContext } from "react";
import { ExmaContext } from "../providers";

export function useExma() {
  return useContext(
    ExmaContext
  ) as import("../providers").ExmaContext;
}
