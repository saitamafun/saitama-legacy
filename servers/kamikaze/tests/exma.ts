import { das } from "@metaplex-foundation/mpl-core-das";

import { SafeJson } from "@/lib/utils";
import { umi } from "@/lib/web3";

import { publicKey } from "@metaplex-foundation/umi";

async function main() {
  const nonNativeTokens = await das.searchAssets(umi, {
    owner: publicKey("8tRDW4DimbY8GDwZH5ZtC6Edke6YpZdrgJzaaxrZjqAG"),
    skipDerivePlugins: true,
  });
  console.log(SafeJson.stringify(nonNativeTokens, 2));
}

main().catch(console.log);
