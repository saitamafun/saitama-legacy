import { type DigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import { ApiImpl } from "./impl";

export class RpcApi extends ApiImpl {
  path = "/rpc/";

  getAllDigitalAsset(mints: string[]) {
    return this.xior.post<DigitalAsset[]>(
      this.buildPath("getAllDigitalAsset"),
      { mints }
    );
  }
}
