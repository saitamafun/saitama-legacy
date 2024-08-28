import { Crud } from "./impl";
import type { Wallet } from "./models/wallet.model";

export class WalletApi extends Crud<Wallet> {
  path = "wallets";
}
