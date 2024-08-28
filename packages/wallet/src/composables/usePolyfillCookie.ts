import { useContext } from "react";
import { PolyfillCookieContext } from "../providers/PolyfillCookieProvider";

export default function usePolyfillCookie<T extends string>(
  _dependecies?: T[]
) {
  const { cookies, setCookie, removeCookie } = useContext(
    PolyfillCookieContext
  ) as unknown as import("../providers/PolyfillCookieProvider").PolyfillCookieContextProps<{
    [key in T]: string | undefined;
  }>;

  return [cookies, setCookie, removeCookie] as const;
}
