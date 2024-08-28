import { createContext, useEffect, useState } from "react";

import { getProgram } from "@saitamafun/sdk";
import { AnchorProvider } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";

type ProgramContext = {
  program: ReturnType<typeof getProgram> | null;
};

export const ProgramContext = createContext<ProgramContext>({
  program: null,
});

export function ProgramProvider({ children }: React.PropsWithChildren) {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [program, setProgram] = useState<ReturnType<typeof getProgram> | null>(
    null
  );

  useEffect(() => {
    if (wallet) {
      const anchorProvider = new AnchorProvider(connection, wallet as any, {});
      setProgram(getProgram(anchorProvider));
    }
  }, [wallet]);

  return (
    <ProgramContext.Provider value={{ program }}>
      {children}
    </ProgramContext.Provider>
  );
}
