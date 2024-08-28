import NodeCache from "node-cache";
import { createDB } from "./db";
import * as schema from "./db/schema";
import { DATABASE_URL } from "./config";

export const db = createDB(DATABASE_URL, schema);

export class Application {
  readonly cache: NodeCache;
  readonly db: typeof db;

  private constructor() {
    this.cache = new NodeCache();
    this.db = db;
  }

  static #instance: Application;

  static get instance() {
    if (!Application.#instance) Application.#instance = new Application();

    return Application.#instance;
  }
}
