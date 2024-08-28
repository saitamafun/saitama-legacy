import { Api } from "@saitamafun/sdk";
import { createContext, useMemo } from "react";

type ApiContext = {
  api: Api | null;
};

export const ApiContext = createContext<ApiContext>({ api: null });
type ApiProviderProps = {
  endpoint: string;
  accessToken: string;
};

export function ApiProvider({
  endpoint,
  accessToken,
  children,
}: ApiProviderProps & React.PropsWithChildren) {
  const api = useMemo(() => new Api(endpoint, accessToken), [accessToken]);

  return <ApiContext.Provider value={{ api }}>{children}</ApiContext.Provider>;
}
