"use client";

import { createContext, useCallback, useEffect, useState } from "react";

export type PermissionContext = {
  hasPermission: boolean;
  setPermission: () => Promise<boolean>;
};

export const PermissionContext = createContext<Partial<PermissionContext>>({});

export function PermissionProvider({ children }: React.PropsWithChildren) {
  const [hasPermission, setHasPermission] = useState<boolean>(true);

  const onPermissionChange = useCallback(
    async function () {
      setHasPermission(true);
      return true;
    },
    [setHasPermission]
  );

  const setPermission = async () => {
    if ("requestStorageAccess" in document) {
      await document.requestStorageAccess();
      return onPermissionChange();
    } else setHasPermission(true);

    return true;
  };

  useEffect(() => {
    onPermissionChange();
    window.addEventListener("change", onPermissionChange);
    return () => window.removeEventListener("change", onPermissionChange);
  }, []);

  return (
    <PermissionContext.Provider value={{ hasPermission, setPermission }}>
      {children}
    </PermissionContext.Provider>
  );
}
