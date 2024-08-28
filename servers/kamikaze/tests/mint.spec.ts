import {
  fetchAllDigitalAssetWithTokenByOwner,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl, PublicKey } from "@solana/web3.js";

async function main(account: ReturnType<typeof publicKey>) {
  const umi = createUmi(clusterApiUrl("devnet")).use(mplTokenMetadata());

  const tokenAccounts = await fetchAllDigitalAssetWithTokenByOwner(
    umi,
    account,
    {
      tokenAmountFilter: (amount) => amount >= 0n,
    }
  );
  console.log(tokenAccounts);
}

main(publicKey("2menEvaDu9VmUawWEjTthGaN9DQ4SSN6ZfXHfZJvf8rn")).catch(
  console.log
);
