import { useState } from "react";
import { useMediaQuery } from "react-responsive";

type Media = "light" | "dark";

export function useMedia() {
  const match = (value: boolean) => (value ? "dark" : "light");

  const isDark = useMediaQuery(
    {
      query: "(prefers-color-scheme: dark)",
    },
    undefined,
    (isDark) => setMedia(match(isDark))
  );

  const is = (value: Media) => media === value;

  const [media, setMedia] = useState<Media>(match(isDark));

  return { media, is };
}
