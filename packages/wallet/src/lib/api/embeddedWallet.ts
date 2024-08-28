import bs58 from "bs58";
import { type Keypair, PublicKey } from "@solana/web3.js";
import type { DigitalAsset } from "@metaplex-foundation/mpl-token-metadata";

import { ApiImpl } from "./impl";
import type { Portfolio } from "./models/portfolio.model";
import type {
  EmbeddedWallet,
  RefinedEmbeddeWallet,
} from "./models/embeddedWallet.model";

export class EmbeddedWalletApi extends ApiImpl {
  path = "/apps/auth/wallets/";

  getPlainWallets() {
    return this.xior.get<EmbeddedWallet[]>(this.path).then(({ data }) => data);
  }

  static refineWallets(wallets: EmbeddedWallet[]) {
    return wallets.map((wallet) => ({
      ...wallet,
      publicKey: new PublicKey(wallet.publicKey),
    }));
  }

  getWallets(): Promise<RefinedEmbeddeWallet[]> {
    return this.xior
      .get<EmbeddedWallet[]>(this.path)
      .then(({ data }) => data)
      .then(EmbeddedWalletApi.refineWallets);
  }

  getPortfolio(id: string) {
    return this.xior.get<Portfolio[]>(this.buildPath(id, "portfolio"));
  }

  getMintMetadata(mints: string[]) {
    return this.xior.post<DigitalAsset[]>(
      this.buildPath("miscellaneous", "metadata"),
      { mints }
    );
  }

  sendTransaction(
    id: string,
    transaction: Array<number>,
    signers: Keypair[],
    rpcEndpoint: string
  ) {
    return this.xior.post<string>(this.buildPath(id, "sendTransaction"), {
      transaction,
      rpcEndpoint,
      signers: signers.map((signer) => bs58.encode(signer.secretKey)),
    });
  }
}
