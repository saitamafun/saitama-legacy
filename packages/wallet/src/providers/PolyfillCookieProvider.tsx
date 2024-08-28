import { createContext, useState } from "react";
import { CookiesProvider, useCookies } from "react-cookie";

import { sendMessage, type CookieSetOptions } from "../lib";

export type PolyfillCookieContextProps<
  T extends Record<string, any> = Record<string, any>
> = {
  cookies: T;
  setCookie: (name: keyof T, value: string, options?: CookieSetOptions) => void;
  removeCookie: (name: keyof T, options?: CookieSetOptions) => void;
};

export const PolyfillCookieContext = createContext<
  Partial<PolyfillCookieContextProps>
>({});

type PolyfillCookieProviderProps = {
  firstPartyCookies: Record<string, any>;
} & React.PropsWithChildren &
  Omit<React.ComponentProps<typeof CookiesProvider>, "ref">;

export default function PolyfillCookieProvider({
  children,
  firstPartyCookies,
  ...props
}: PolyfillCookieProviderProps) {
  return (
    <CookiesProvider {...props}>
      <InnerProvider
        {...props}
        firstPartyCookies={firstPartyCookies}
      >
        {children}
      </InnerProvider>
    </CookiesProvider>
  );
}

function InnerProvider({
  firstPartyCookies,
  children,
}: PolyfillCookieProviderProps) {
  const [cookies, setCookies, removeCookies] = useCookies();
  const [polyfillCookies, setPolyfillSetCookies] = useState(firstPartyCookies);
  const setCookie = (
    name: string,
    value: string,
    options: CookieSetOptions
  ) => {
    setCookies(name, value, options);
    sendMessage("set.cookie", { name, value, options });
    setPolyfillSetCookies((cookies) => {
      cookies[name] = value;
      return { ...cookies };
    });
  };

  const removeCookie = (name: string, options: CookieSetOptions) => {
    removeCookies(name, options);
    sendMessage("delete.cookie", { name, options });

    setPolyfillSetCookies((cookies) => {
      delete cookies[name];

      return { ...cookies };
    });
  };

  return (
    <PolyfillCookieContext.Provider
      value={{
        cookies: { ...polyfillCookies, ...cookies },
        setCookie,
        removeCookie,
      }}
    >
      {children}
    </PolyfillCookieContext.Provider>
  );
}
