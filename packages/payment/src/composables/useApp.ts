import { useEffect, useState } from "react";
import type { Api, App } from "@saitamafun/sdk";

import type { LoadingState } from "../types";

export const useApp = (api: Api, id: string) => {
  const [state, setState] = useState<LoadingState>("idle");
  const [value, setValue] = useState<[Error | null, App | null]>([null, null]);

  useEffect(() => {
    api.app
      .retrieve(id)
      .then(({ data }) => {
        setState("success");
        setValue([null, data]);
      })
      .catch((error) => {
        setState("error");
        setValue([error, null]);
      });
  }, [id]);

  return [state, value] as const;
};
