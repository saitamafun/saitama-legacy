"use client";

import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "@firebase/auth";

import { createContext } from "react";
import { useEffect, useState } from "react";

import { useExma } from "../composables";
import { Firebase } from "../lib/firebase";
import usePolyfillCookie from "../composables/usePolyfillCookie";

type FirebaseContext = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

export const FirebaseContext = createContext<FirebaseContext>({
  user: null,
  setUser: () => void 0,
});

type FirebaseProviderProps = {
  serverUser: import("../lib/api/models").User | null;
  setServerUser: React.Dispatch<
    React.SetStateAction<import("../lib/api/models").User | null>
  >;
  isFetched?: boolean;
};

export default function FirebaseProvider({
  isFetched,
  serverUser,
  setServerUser,
  children,
}: FirebaseProviderProps & React.PropsWithChildren) {
  const router = useRouter();
  const { api } = useExma();
  const [user, setUser] = useState<User | null>(null);
  const [cookies, setCookie] = usePolyfillCookie(["accessToken"]);

  useEffect(() => {
    return onAuthStateChanged(Firebase.instance.auth, setUser);
  }, [setUser]);

  useEffect(() => {
    if (serverUser) return;
    if (isFetched && user && user.emailVerified && !cookies.accessToken) {
      user
        .getIdToken()
        .then((token) => api.auth.authenticate(token).then(({ data }) => data))
        .then((tokenWithUser) => {
          setServerUser(tokenWithUser.user);
          setCookie("accessToken", tokenWithUser.token);
          router.refresh();
        });
    }
  }, [serverUser, user, isFetched]);

  return (
    <FirebaseContext.Provider value={{ user, setUser }}>
      {children}
    </FirebaseContext.Provider>
  );
}
