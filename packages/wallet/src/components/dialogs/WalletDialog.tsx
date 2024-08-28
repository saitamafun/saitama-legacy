"use client";

import type { AssetV1 } from "@metaplex-foundation/mpl-core";
import type { DigitalAssetWithToken } from "@metaplex-foundation/mpl-token-metadata";

import { AiOutlineSwap } from "react-icons/ai";
import { useEffect, useState, useCallback, useMemo } from "react";
import { MdAdd, MdArrowOutward, MdSettings } from "react-icons/md";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

import { useWallet } from "../../composables";
import { sendMessage, type RefinedEmbeddeWallet } from "../../lib";

import Info from "../widgets/Info";
import Loading from "../widgets/Loading";

import WalletNFTList, { WalletNFTListSkeletion } from "../WalletNFTList";
import WalletTokenList, { WalletTokenListSkeleton } from "../WalletTokenList";

import PostMessage from "../PostMessage";

import AlertDialog from "./AlertDialog";
import { FundDialog } from "./FundDialog";
import SendTokenDialog from "./SendTokenDialog";
import { SelectTokenDialog } from "./SelectTokenDialog";

type WalletDialogProps = {
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
};

export function WalletDialog({ open, setOpen }: WalletDialogProps) {
  const { wallets, wallet, setWallet, portfolio, nftPortfolio } = useWallet();

  const updateWallet = useCallback(
    (wallet: RefinedEmbeddeWallet) => setWallet(wallet),
    [wallet]
  );

  const loading = useMemo(
    () => wallet && wallets && portfolio && nftPortfolio,
    [wallet, wallets, portfolio, nftPortfolio]
  );

  useEffect(() => {
    if (wallets) {
      const wallet = wallets[0];

      if (wallet) {
        updateWallet(wallet);
        sendMessage("wallet", {
          status: "connected",
          publicKey: wallet.publicKey.toBase58(),
        });
      }
    }
  }, [wallets]);

  return (
    <AlertDialog
      open={open}
      setOpen={setOpen}
      title="Digital Wallet"
      className="h-xl overflow-y-scroll"
      actions={
        <button>
          <MdSettings className="text-2xl text-black/75 dark:text-white/75" />
        </button>
      }
    >
      {loading ? (
        <section className="flex-1 flex flex-col  space-y-4 pb-4 overflow-y-scroll">
          <div className="flex flex-col space-y-4">
            <Info
              text="Use your wallet to store, send and recieve digital assets and
  collectibles."
            />
            <WalletActionCard
              wallet={wallet}
              portfolio={portfolio?.data}
            />
          </div>
          <TabGroup className="flex-1 flex flex-col space-y-4 overflow-y-hidden">
            <TabList className=" tab-list">
              <Tab className="tab">Tokens</Tab>
              <Tab
                disabled={nftPortfolio?.data?.length === 0}
                className="tab"
              >
                NFTs
              </Tab>
            </TabList>
            <TabPanels className="flex-1 flex flex-col divide-y divide-dark overflow-y-scroll">
              <WalletTokenListTab portfolio={portfolio?.data} />
              <WalletNftListTab portfolio={nftPortfolio?.data} />
            </TabPanels>
          </TabGroup>
        </section>
      ) : (
        <Loading />
      )}
      <PostMessage />
    </AlertDialog>
  );
}

type ActionProps = {
  wallet: RefinedEmbeddeWallet;
  portfolio?: DigitalAssetWithToken[];
};

function SendCryptoAction() {
  const [open, setOpen] = useState(false);
  const [digitalAssetWithToken, setDigitalAssetWithToken] =
    useState<DigitalAssetWithToken | null>(null);

  return (
    <>
      <div
        className="flex flex-col items-center justify-center space-y-1"
        onClick={() => setOpen(true)}
      >
        <button className="bg-white  text-black p-2 rounded-full">
          <MdArrowOutward className="text-lg" />
        </button>
        <small>Send</small>
      </div>
      <SelectTokenDialog
        open={open}
        setOpen={setOpen}
        onSelect={setDigitalAssetWithToken}
      />
      {digitalAssetWithToken && (
        <SendTokenDialog
          digitalAssetWithToken={digitalAssetWithToken}
          open={Boolean(digitalAssetWithToken)}
          setOpen={(value) => (value ? void 0 : setDigitalAssetWithToken(null))}
        />
      )}
    </>
  );
}

function AddCryptoAction({ wallet }: ActionProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="flex flex-col items-center justify-center space-y-1"
        onClick={() => setOpen(true)}
      >
        <button className="bg-white  text-black p-2 rounded-full">
          <MdAdd className="text-lg" />
        </button>
        <small>Add</small>
      </div>
      <FundDialog
        open={open}
        setOpen={setOpen}
        address={wallet.publicKey.toBase58()}
      />
    </>
  );
}

function WalletActionCard({ wallet }: ActionProps) {
  return (
    <div className="flex flex-col  space-y-4 bg-gradient-to-r from-violet-500 to-cyan-500 text-white px-4 pt-4 pb-2 rounded-md dark:from-violet-300 dark:to-cyan-300 dark:text-black">
      <div className="flex-1 flex flex-col items-center space-y-2">
        <h1 className="text-4xl font-extrabold font-mono">$0.00</h1>
      </div>
      <div className="self-center flex items-center space-x-4">
        <SendCryptoAction />
        <AddCryptoAction wallet={wallet} />
        <div className="flex flex-col items-center justify-center space-y-1">
          <button className="bg-white  text-black p-2 rounded-full">
            <AiOutlineSwap className="text-lg" />
          </button>
          <small>Swap</small>
        </div>
      </div>
    </div>
  );
}

type WalletTokenListTabProps = {
  portfolio?: DigitalAssetWithToken[];
};

function WalletTokenListTab({ portfolio }: WalletTokenListTabProps) {
  const [digitalAssetWithToken, setDigitalAssetWithToken] =
    useState<DigitalAssetWithToken | null>(null);

  return (
    <TabPanel className="flex-1 flex flex-col overflow-y-scroll">
      {portfolio ? (
        <WalletTokenList
          digitalAssetsWithTokens={portfolio}
          onSelect={setDigitalAssetWithToken}
        />
      ) : (
        <WalletTokenListSkeleton length={3} />
      )}
      {digitalAssetWithToken && (
        <SendTokenDialog
          digitalAssetWithToken={digitalAssetWithToken}
          open={Boolean(digitalAssetWithToken)}
          setOpen={(value) => (value ? void 0 : setDigitalAssetWithToken(null))}
        />
      )}
    </TabPanel>
  );
}

type WalletNftListTabProps = {
  portfolio?: AssetV1[];
};

function WalletNftListTab({ portfolio }: WalletNftListTabProps) {
  const [, setAsset] = useState<AssetV1 | null>(null);

  return (
    <TabPanel className="flex-1 grid grid-cols-3 gap-2 overflow-y-scroll">
      {portfolio ? (
        portfolio.length > 0 ? (
          <WalletNFTList
            assets={portfolio}
            onSelect={setAsset}
          />
        ) : (
          <WalletNFTListSkeletion length={4} />
        )
      ) : (
        <WalletNFTListSkeletion length={4} />
      )}
    </TabPanel>
  );
}
