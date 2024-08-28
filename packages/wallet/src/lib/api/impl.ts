import type { XiorInstance } from "xior";

export abstract class ApiImpl {
  abstract path: string;

  constructor(readonly xior: XiorInstance){}
  
  readonly buildPath = (...paths: string[]) => this.path + paths.join("/");

}
