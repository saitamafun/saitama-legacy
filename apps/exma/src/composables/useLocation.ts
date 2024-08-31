import { useCallback, useEffect, useState } from "react";

export default function useLocation() {
  const [location, setLocation] = useState<(typeof window)["location"] | null>(
    null
  );

  const onHashChange = useCallback(
    () => setLocation(window.location),
    [setLocation]
  );

  useEffect(() => {
    if (typeof window !== "undefined" && "location" in window) {
      onHashChange();
      window.addEventListener("hashchange", onHashChange);
      return () => window.removeEventListener("hashchange", onHashChange);
    }
  }, [onHashChange]);

  return location;
}
