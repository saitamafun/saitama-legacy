import xior, { type XiorInstance } from "xior";
import { PaymentApi } from "./payment";
import { AppApi } from "./app";

export class Api {
  private readonly xior: XiorInstance;

  readonly payment: PaymentApi;
  readonly app: AppApi;

  constructor(
    private readonly endpoint: string,
    private readonly accessToken: string
  ) {
    this.xior = xior.create({
      baseURL: this.endpoint,
      headers: {
        Authorization: "Bearer " + this.accessToken,
      },
    });

    this.app = new AppApi(this.xior);
    this.payment = new PaymentApi(this.xior);
  }
}
