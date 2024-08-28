import { useContext } from "react";
import type { getProgram } from "@saitamafun/sdk";
import { ProgramContext } from "../providers/BofoiProvider";

export const useProgram = function (): ReturnType<typeof getProgram> {
  const { program } = useContext(ProgramContext);

  if (program) return program;

  throw new Error(
    "Make sure you are calling this function as a child of <BofoiProvider/>"
  );
};
