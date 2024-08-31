import xior, { type XiorInstance } from "xior";

import { RpcApi } from "./rpc";
import { AuthApi } from "./auth";
import { UserApi } from "./user";
import { EmbeddedWalletApi } from "./embeddedWallet";

export class Api {
  readonly auth: AuthApi;
  readonly rpc: RpcApi;

  private readonly xior: XiorInstance;

  constructor(readonly baseURL: string, readonly token: string) {
    this.xior = xior.create({
      baseURL,
      credentials: "include",
      mode: "cors",
      headers: {
        Authorization: "Bearer " + this.token,
      },
    });

    this.auth = new AuthApi(this.xior);
    this.rpc = new RpcApi(this.xior);
  }
}

export class AuthUserApi {
  readonly user: UserApi;
  readonly wallet: EmbeddedWalletApi;

  private readonly xior: XiorInstance;

  constructor(
    readonly baseURL: string,
    readonly token?: string,
    readonly cookie?: string
  ) {
    this.xior = xior.create({
      baseURL,
      credentials: "include",
      headers: {
        Cookie: cookie,
        Authorization: this.token ? "Bearer " + this.token : undefined,
      },
    });

    this.user = new UserApi(this.xior);
    this.wallet = new EmbeddedWalletApi(this.xior);
  }
}

export * from "./models";
export { AuthApi, UserApi, RpcApi, EmbeddedWalletApi };
