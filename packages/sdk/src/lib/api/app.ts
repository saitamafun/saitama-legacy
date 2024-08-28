import { Crud } from "./impl";
import type { App } from "./models/app.model";

export class AppApi extends Crud<App> {
  path = "apps";
}
