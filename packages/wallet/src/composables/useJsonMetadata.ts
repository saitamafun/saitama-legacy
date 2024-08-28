import xior from "xior";
import type { JsonMetadata } from "@metaplex-foundation/mpl-token-metadata";

import { useEffect, useState } from "react";

import { getDefaultJsonMetadata } from "../lib/web3/metadata";

export const cache: Map<string, JsonMetadata> = new Map();

export function useJsonMetadata(uri: string, mint?: string) {
  const [jsonMetadata, setJsonMetadata] = useState<JsonMetadata | null>(null);

  useEffect(() => {
    const cached = cache.get(uri);
    if (cached) return setJsonMetadata(cached);
    if (uri)
      xior
        .get(uri)
        .then(({ data }) => data)
        .then((metadata) => {
          cache.set(uri, metadata);
          return setJsonMetadata(metadata);
        });
    else if (mint) setJsonMetadata(getDefaultJsonMetadata(mint));
  }, [uri]);

  return jsonMetadata;
}
