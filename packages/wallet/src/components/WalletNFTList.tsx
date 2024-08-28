import type { AssetV1 } from "@metaplex-foundation/mpl-core";

import { useJsonMetadata } from "../composables/useJsonMetadata";

type WalletNftListProps = {
  assets: AssetV1[];
  onSelect: React.Dispatch<React.SetStateAction<AssetV1 | null>>;
};

type WalletNFTProps = {
  asset: AssetV1;
  onClick: () => void;
};

const NFTSkeleton = () => (
  <div className="flex flex-col space-y-1">
    <div className=" h-36 flex flex-col bg-dark-300 p-2 animate-pulse rounded-md">
      <div className="flex-1 relative">
        <div className="absolute p-3 bg-white/30 rounded animate-pulse hidden" />
      </div>
    </div>
    <div className="p-2 w-3/4 bg-dark-300 rounded animate-pulse" />
  </div>
);

const WalletNFT = ({ asset, onClick }: WalletNFTProps) => {
  const jsonMetadata = useJsonMetadata(asset.uri);

  return jsonMetadata ? (
    <div
      className="relative flex flex-col cursor-pointer"
      onClick={onClick}
    >
      <img
        src={jsonMetadata.image}
        width={128}
        height={128}
        className=" rounded-md"
      />
      <div>
        <p>{asset.name}</p>
      </div>
    </div>
  ) : (
    <NFTSkeleton />
  );
};

export default function WalletNFTList({
  assets,
  onSelect,
}: WalletNftListProps) {
  return assets.map((asset) => (
    <WalletNFT
      key={asset.publicKey}
      asset={asset}
      onClick={() => onSelect(asset)}
    />
  ));
}

type WalletNFTListSkeletionProps = {
  length: number;
};

export const WalletNFTListSkeletion = ({
  length,
}: WalletNFTListSkeletionProps) => {
  return Array.from(Array.from({ length }).entries()).map(([index]) => (
    <NFTSkeleton key={index} />
  ));
};
