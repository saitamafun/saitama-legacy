import clsx from "clsx";
import type { DigitalAssetWithToken } from "@metaplex-foundation/mpl-token-metadata";

import { toUIAmount } from "../lib/web3/math";
import { useJsonMetadata } from "../composables/useJsonMetadata";

type WalletTokenList = {
  className?: string;
  digitalAssetsWithTokens: DigitalAssetWithToken[];
  onSelect: (value: DigitalAssetWithToken) => void;
};

type WalletTokenProps = {
  className?: string;
  onClick: () => void;
  digitalAssetWithToken: DigitalAssetWithToken;
};

const WalletToken = ({
  digitalAssetWithToken: { mint, metadata, token },
  className,
  onClick,
}: WalletTokenProps) => {
  const jsonMetadata = useJsonMetadata(metadata.uri, mint.publicKey);

  return (
    <div
      key={mint.publicKey}
      className={clsx(
        className,
        "flex space-x-2 items-center p-2 cursor-pointer"
      )}
      onClick={onClick}
    >
      {jsonMetadata && jsonMetadata.image ? (
        <img
          src={jsonMetadata.image}
          className="w-10 h-10  rounded-full"
        />
      ) : (
        <div className="w-10 h-10 bg-white/50 rounded-full animate-pulse" />
      )}

      <div className="flex-1">
        <p className="text-md font-medium">{metadata.name}</p>
        <p className="text-xs font-mono text-black/75 dark:text-white/75">
          {toUIAmount(token.amount, mint.decimals)} {metadata.symbol}
        </p>
      </div>
    </div>
  );
};

export default function WalletTokenList({
  className,
  digitalAssetsWithTokens,
  onSelect,
}: WalletTokenList) {
  return digitalAssetsWithTokens.map((digitalAssetWithToken) => {
    return (
      <WalletToken
        key={digitalAssetWithToken.publicKey}
        className={className}
        digitalAssetWithToken={digitalAssetWithToken}
        onClick={() => onSelect(digitalAssetWithToken)}
      />
    );
  });
}

type WalletTokenListSkeletonProps = {
  length: number;
};

export const WalletTokenListSkeleton = function ({
  length,
}: WalletTokenListSkeletonProps) {
  return Array.from({ length }).map((_, index) => (
    <div
      key={index}
      className="flex space-x-2 items-center p-2"
    >
      <div className="w-10 h-10 bg-black/30 rounded-full animate-pulse dark:bg-white/50 " />
      <div className="flex-1 flex flex-col space-y-1">
        <div className="w-1/2 p-1 bg-black/30 rounded-sm animate-pulse dark:bg-white/50 " />
        <div className="w-1/4 p-1 bg-black/30 rounded-sm animate-pulse dark:bg-white/50" />
      </div>
    </div>
  ));
};
