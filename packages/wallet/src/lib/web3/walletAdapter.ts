import {
  BaseWalletAdapter,
  WalletNotReadyError,
  WalletReadyState,
  type SendTransactionOptions,
  type SupportedTransactionVersions,
  type TransactionOrVersionedTransaction,
  type WalletName,
} from "@solana/wallet-adapter-base";
import {
  PublicKey,
  type Connection,
  type TransactionSignature,
} from "@solana/web3.js";

import { Cookies } from "react-cookie";

import type { PostEvent, PreEvent } from "./types";
import { encodeParams, type SaitamaURLParams } from "./utils";

export const SaitamaWalletName = "Saitama" as WalletName<"Saitama">;

export class SaitamaWalletAdapter extends BaseWalletAdapter {
  name = SaitamaWalletName;
  url = "https://wallet.saitama.fun";
  icon =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTg2IiBoZWlnaHQ9IjIyOCIgdmlld0JveD0iMCAwIDE4NiAyMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xODYgMEgwVjIyOEgxODZWMFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMDEuMDI5IDJDMTE0LjI1MiAyIDEyNy4xOTUgMy43MTc1NiAxMzkuODMxIDcuMTQwMzRDMTUyLjQ5NSAxMC41Mzg0IDE2MS44ODggMTMuODg3IDE2OC4wMSAxNy4xNzM5TDE3Ni44OTkgMjIuNDEzMUwxNTQuMzY4IDYxLjcwN0MxNTIuNjA3IDYwLjY5MzcgMTUwLjE0NiA1OS4zNTkyIDE0Ni45ODggNTcuNzAzNEMxNDMuODE1IDU2LjAyMjkgMTM3Ljg4OCA1My43ODY0IDEyOS4yMDggNTAuOTgxNUMxMjAuNTE0IDQ4LjE4ODkgMTEyLjQwNyA0Ni43ODAyIDEwNC44ODcgNDYuNzgwMkM5NS42MDYyIDQ2Ljc4MDIgODguNDQ5NyA0OC41MzQ5IDgzLjQxNzggNTIuMDE5NEM3OC4zODU5IDU1LjUxNjMgNzUuODY5OSA2MC4yMjQyIDc1Ljg2OTkgNjYuMTU1M0M3NS44Njk5IDY5LjE1OCA3Ny4wNDQxIDcxLjkyNTkgNzkuMzkyMyA3NC40NTlDODEuNzY4NSA3Ni45NjczIDg1LjgyMTkgNzkuNjczNCA5MS41MjQ4IDgyLjU2NDlDOTcuMjU1NSA4NS40MzE2IDEwMi4zMTUgODcuNzQyMyAxMDYuNjc2IDg5LjQ4NDZDMTExLjAzNyA5MS4yMzkyIDExNy43NDcgOTMuODU4OCAxMjYuODA0IDk3LjM0MzNDMTQyLjU5OSAxMDMuMjc0IDE1Ni4wNzMgMTExLjM1NiAxNjcuMjI3IDEyMS41NjJDMTc4LjQwOSAxMzEuNzgxIDE4NCAxNDMuMzU5IDE4NCAxNTYuMzA5QzE4NCAxNjguNzAzIDE4MS40ODQgMTc5LjUyNyAxNzYuNDUyIDE4OC43ODJDMTcxLjQyIDE5OC4wNDkgMTY0LjUwMSAyMDUuMjkgMTU1LjcxIDIxMC41M0MxNDYuOTA0IDIxNS43NjkgMTM3LjE3NSAyMTkuNjYxIDEyNi41MjQgMjIyLjE5NEMxMTUuODYgMjI0LjcyNyAxMDQuMyAyMjYgOTEuODYwMiAyMjZDODEuMTk1NCAyMjYgNzAuNzI2MiAyMjUuMDI0IDYwLjQzODggMjIzLjA4NEM1MC4xNzkzIDIyMS4xODEgNDEuNTk3MSAyMTguNzg0IDM0LjY2NDIgMjE1LjkxN0MyNy43NTkzIDIxMy4wMjYgMjEuNTM5MyAyMTAuMTcxIDE1Ljk5MDMgMjA3LjM2NkMxMC40NjkyIDIwNC41NzQgNi40Mjk2NiAyMDIuMjE0IDMuODU3NzkgMjAwLjI5OEwwIDE5Ny40MzJMMjcuODQzMiAxNTYuMDEyQzMwLjIxOTQgMTU3Ljc2NyAzMy40OTAxIDE2MC4wMDQgMzcuNjI3NSAxNjIuNzM0QzQxLjc2NDggMTY1LjQ0IDQ5LjEwMyAxNjkuMDYxIDU5LjY1NiAxNzMuNjA4QzcwLjIzNyAxNzguMTMxIDc5LjU4OCAxODAuMzggODcuNzIyOSAxODAuMzhDMTExLjIwNSAxODAuMzggMTIyLjk0NiAxNzMuMzEyIDEyMi45NDYgMTU5LjE3NkMxMjIuOTQ2IDE1Ni4yMSAxMjIuMTA4IDE1My40NjcgMTIwLjQzIDE1MC45MjFDMTE4Ljc1MyAxNDguMzg4IDExNS43OSAxNDUuODU1IDExMS41NDEgMTQzLjMxQzEwNy4yOTEgMTQwLjc3NyAxMDMuNTQ1IDEzOC43NjMgMTAwLjMwMyAxMzcuMjhDOTcuMDU5OSAxMzUuNzk3IDkxLjcyMDQgMTMzLjU0OCA4NC4zMTI0IDEzMC41MDhDNzYuODkwMyAxMjcuNDQ0IDcxLjQxMTEgMTI1LjEyMSA2Ny44NzQ4IDEyMy41MzlDNTMuMDMwNyAxMTcuMDg5IDQxLjU2OTEgMTA5LjAwOCAzMy40OTAxIDk5LjMyMDRDMjUuMzk3MSA4OS42MzI4IDIxLjM1NzYgNzkuMjAzOSAyMS4zNTc2IDY4LjAzMzVDMjEuMzU3NiA0OC42MzM3IDI5LjQzNjYgMzIuNzgwMiA0NS42MjI2IDIwLjQ4NTRDNjEuODM2NSA4LjE2NTkzIDgwLjMwMDggMiAxMDEuMDI5IDJaIiBmaWxsPSJibGFjayIvPgo8bWFzayBpZD0ibWFzazBfNl8yMCIgc3R5bGU9Im1hc2stdHlwZTphbHBoYSIgbWFza1VuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeD0iMCIgeT0iMiIgd2lkdGg9IjE4NCIgaGVpZ2h0PSIyMjQiPgo8cGF0aCBkPSJNMTAxLjAyOSAyQzExNC4yNTIgMiAxMjcuMTk1IDMuNzE3NTYgMTM5LjgzMSA3LjE0MDM0QzE1Mi40OTUgMTAuNTM4NCAxNjEuODg4IDEzLjg4NyAxNjguMDEgMTcuMTczOUwxNzYuODk5IDIyLjQxMzFMMTU0LjM2OCA2MS43MDdDMTUyLjYwNyA2MC42OTM3IDE1MC4xNDYgNTkuMzU5MiAxNDYuOTg4IDU3LjcwMzRDMTQzLjgxNSA1Ni4wMjI5IDEzNy44ODggNTMuNzg2NCAxMjkuMjA4IDUwLjk4MTVDMTIwLjUxNCA0OC4xODg5IDExMi40MDcgNDYuNzgwMiAxMDQuODg3IDQ2Ljc4MDJDOTUuNjA2MiA0Ni43ODAyIDg4LjQ0OTcgNDguNTM0OSA4My40MTc4IDUyLjAxOTRDNzguMzg1OSA1NS41MTYzIDc1Ljg2OTkgNjAuMjI0MiA3NS44Njk5IDY2LjE1NTNDNzUuODY5OSA2OS4xNTggNzcuMDQ0MSA3MS45MjU5IDc5LjM5MjMgNzQuNDU5QzgxLjc2ODUgNzYuOTY3MyA4NS44MjE5IDc5LjY3MzQgOTEuNTI0OCA4Mi41NjQ5Qzk3LjI1NTUgODUuNDMxNiAxMDIuMzE1IDg3Ljc0MjMgMTA2LjY3NiA4OS40ODQ2QzExMS4wMzcgOTEuMjM5MiAxMTcuNzQ3IDkzLjg1ODggMTI2LjgwNCA5Ny4zNDMzQzE0Mi41OTkgMTAzLjI3NCAxNTYuMDczIDExMS4zNTYgMTY3LjIyNyAxMjEuNTYyQzE3OC40MDkgMTMxLjc4MSAxODQgMTQzLjM1OSAxODQgMTU2LjMwOUMxODQgMTY4LjcwMyAxODEuNDg0IDE3OS41MjcgMTc2LjQ1MiAxODguNzgyQzE3MS40MiAxOTguMDQ5IDE2NC41MDEgMjA1LjI5IDE1NS43MSAyMTAuNTNDMTQ2LjkwNCAyMTUuNzY5IDEzNy4xNzUgMjE5LjY2MSAxMjYuNTI0IDIyMi4xOTRDMTE1Ljg2IDIyNC43MjcgMTA0LjMgMjI2IDkxLjg2MDIgMjI2QzgxLjE5NTQgMjI2IDcwLjcyNjIgMjI1LjAyNCA2MC40Mzg4IDIyMy4wODRDNTAuMTc5MyAyMjEuMTgxIDQxLjU5NzEgMjE4Ljc4NCAzNC42NjQyIDIxNS45MTdDMjcuNzU5MyAyMTMuMDI2IDIxLjUzOTMgMjEwLjE3MSAxNS45OTAzIDIwNy4zNjZDMTAuNDY5MiAyMDQuNTc0IDYuNDI5NjYgMjAyLjIxNCAzLjg1Nzc5IDIwMC4yOThMMCAxOTcuNDMyTDI3Ljg0MzIgMTU2LjAxMkMzMC4yMTk0IDE1Ny43NjcgMzMuNDkwMSAxNjAuMDA0IDM3LjYyNzUgMTYyLjczNEM0MS43NjQ4IDE2NS40NCA0OS4xMDMgMTY5LjA2MSA1OS42NTYgMTczLjYwOEM3MC4yMzcgMTc4LjEzMSA3OS41ODggMTgwLjM4IDg3LjcyMjkgMTgwLjM4QzExMS4yMDUgMTgwLjM4IDEyMi45NDYgMTczLjMxMiAxMjIuOTQ2IDE1OS4xNzZDMTIyLjk0NiAxNTYuMjEgMTIyLjEwOCAxNTMuNDY3IDEyMC40MyAxNTAuOTIxQzExOC43NTMgMTQ4LjM4OCAxMTUuNzkgMTQ1Ljg1NSAxMTEuNTQxIDE0My4zMUMxMDcuMjkxIDE0MC43NzcgMTAzLjU0NSAxMzguNzYzIDEwMC4zMDMgMTM3LjI4Qzk3LjA1OTkgMTM1Ljc5NyA5MS43MjA0IDEzMy41NDggODQuMzEyNCAxMzAuNTA4Qzc2Ljg5MDMgMTI3LjQ0NCA3MS40MTExIDEyNS4xMjEgNjcuODc0OCAxMjMuNTM5QzUzLjAzMDcgMTE3LjA4OSA0MS41NjkxIDEwOS4wMDggMzMuNDkwMSA5OS4zMjA0QzI1LjM5NzEgODkuNjMyOCAyMS4zNTc2IDc5LjIwMzkgMjEuMzU3NiA2OC4wMzM1QzIxLjM1NzYgNDguNjMzNyAyOS40MzY2IDMyLjc4MDIgNDUuNjIyNiAyMC40ODU0QzYxLjgzNjUgOC4xNjU5MyA4MC4zMDA4IDIgMTAxLjAyOSAyWiIgZmlsbD0iYmxhY2siLz4KPC9tYXNrPgo8ZyBtYXNrPSJ1cmwoI21hc2swXzZfMjApIj4KPHBhdGggZD0iTTIxNi4zMTggNjQuNjE5M0gxODEuNzE3QzEyMi40OTYgNTMuMTQwOCAxMDkuMzEzIDQxLjMwNjEgOTYuNDkyNiAtMTEuODExVi00MS41ODM3SDkyLjExNTVWLTExLjUwMTFDNzkuMzMwMSA0MS4zNTI1IDY2LjA5NSA1My4xNTYzIDYuOTc3OTUgNjQuNjE5M0gtMTguMjY0VjY4LjUzODRINi45Nzc5NUM2Ni4wOTUgNzkuOTg1OSA3OS4zMzAxIDkxLjc4OTcgOTIuMTE1NSAxNDQuNjQzVjE3NC4xODRIOTYuNDkyNlYxNDQuOTUzQzEwOS4zMTMgOTEuODUxNiAxMjIuNDk2IDgwLjAxNjkgMTgxLjcxNyA2OC41Mzg0SDIxNi4zMThWNjQuNjE5M1oiIGZpbGw9IndoaXRlIi8+CjwvZz4KPC9zdmc+Cg==";

  iframe: HTMLIFrameElement | null;

  readyState: WalletReadyState;

  connecting: boolean;
  publicKey: PublicKey | null;
  supportedTransactionVersions?: SupportedTransactionVersions = null;

  cookies: Cookies;
  preventOverlay: boolean;

  private readonly subscribers: Map<
    PostEvent.Event["event"],
    Record<string, any>
  >;

  constructor({
    preventOverlay = true,
    ...params
  }: SaitamaURLParams & { preventOverlay?: boolean }) {
    super();

    this.preventOverlay = preventOverlay;
    this.cookies = new Cookies(document.cookie);

    if (params)
      this.url =
        this.url +
        "?hash=" +
        encodeParams(params) +
        "&cookies=" +
        encodeURI(document.cookie);

    this.iframe = null;
    this.publicKey = null;
    this.connecting = false;

    this.subscribers = new Map();
    this.readyState =
      typeof document === "undefined"
        ? WalletReadyState.Unsupported
        : WalletReadyState.Loadable;
  }

  get connected() {
    return !this.connecting && Boolean(this.publicKey);
  }

  async autoConnect() {
    if (this.readyState === WalletReadyState.Loadable) return this.connect();
  }

  async connect() {
    if (this.connecting) return;
    if (this.connected) return;
    else if (this.iframe && document.body.contains(this.iframe))
      return this.onResize();

    this.connecting = true;
    this.iframe = document.createElement("iframe");

    this.iframe.src = this.url;
    this.iframe.style.inset = "0";
    this.iframe.width = "0";
    this.iframe.height = "0";
    this.iframe.style.zIndex = "9999";
    this.iframe.style.position = "fixed";
    this.iframe.sandbox.add(
      ..."allow-scripts allow-forms allow-modals allow-popups allow-same-origin allow-storage-access-by-user-activation".split(
        " "
      )
    );

    this.iframe.addEventListener("error", (event) =>
      this.emit("error", event.error)
    );

    window.addEventListener("resize", this.onResize.bind(this));
    window.addEventListener("message", this.onMessage.bind(this));

    document.body.appendChild(this.iframe);
  }

  async disconnect() {
    if (this.iframe) this.iframe.remove();

    window.removeEventListener("resize", this.onResize.bind(this));
    window.removeEventListener("message", this.onMessage.bind(this));

    this.iframe = null;
    this.emit("disconnect");
  }

  async sendTransaction(
    transaction: TransactionOrVersionedTransaction<null>,
    connection: Connection,
    options?: SendTransactionOptions
  ) {
    return this.safeContext(async () => {
      transaction = await this.prepareTransaction(
        transaction,
        connection,
        options
      );

      const id = this.sendMessage("transaction.approve", {
        options,
        rpcEndpoint: connection.rpcEndpoint,
        message: transaction.serializeMessage().toJSON().data,
      })!;

      this.toggleIframe(true);

      return new Promise<TransactionSignature>((resolve, reject) =>
        this.subscribe("transaction", id, (data) => {
          if (data.error) return reject(data);
          return resolve(data.signature!);
        })
      );
    });
  }

  async selectMint() {
    return this.safeContext(() => {
      const id = this.sendMessage("select.mint", null);

      this.toggleIframe(true);

      return new Promise<PostEvent.SelectMintEvent["data"]>((resolve) =>
        this.subscribe("select.mint", id, resolve)
      );
    });
  }

  async fundWallet() {
    return this.safeContext(() => {
      this.sendMessage("wallet.fund", null);

      this.toggleIframe(true);

      return new Promise<PostEvent.ModalEvent["data"]>((resolve) =>
        this.subscribe("modal", undefined, resolve)
      );
    });
  }

  async showWallet() {
    return this.safeContext(() => {
      this.toggleIframe(true);

      return new Promise<PostEvent.ModalEvent["data"]>((resolve) =>
        this.subscribe("modal", undefined, resolve)
      );
    });
  }

  private onResize() {
    this.iframe!.style.position = "fixed";
    this.iframe!.width = [window.innerWidth, "px"].join("");
    this.iframe!.height = [window.innerHeight, "px"].join("");
  }

  private toggleIframe(show: boolean) {
    if (show) this.onResize();
    else if (document.body.contains(this.iframe)) {
      this.iframe!.width = "0";
      this.iframe!.height = "0";
      this.iframe!.style.position = "static";
    }
  }

  private async onMessage({ origin, data }: MessageEvent<PostEvent.Event>) {
    if (origin === window.location.origin) return;
    const { event, data: payload } = data;

    switch (event) {
      case "modal":
        const { open } = payload;
        if (open) return;
        else if (this.preventOverlay) this.toggleIframe(false);
        break;
      case "wallet":
        const { publicKey } = payload;
        if (publicKey) {
          this.publicKey = new PublicKey(publicKey);
          this.emit("connect", this.publicKey);
        }
        this.toggleIframe(true);
        break;
      case "set.cookie":
        this.cookies.set(payload.name, payload.value, payload.options);
        break;
      case "delete.cookie":
        this.cookies.remove(payload.name, payload.options);
        break;
    }

    this.connecting = false;
    this.publish(data);
  }

  subscribe<E extends PostEvent.Event["event"]>(
    event: E,
    id: string | undefined,
    callback: (data: Extract<PostEvent.Event, { event: E }>["data"]) => void
  ) {
    let listeners = this.subscribers.get(event) ?? {};
    if (!id) id = crypto.randomUUID();

    listeners[id] = callback;
    this.subscribers.set(event, listeners);

    return () => {
      delete listeners[id];
    };
  }

  private async publish({ event, id, data }: PostEvent.Event) {
    const listeners = this.subscribers.get(event as PostEvent.Event["event"]);
    console.log(event + "[publish]", listeners);

    if (listeners) {
      for (const [key, subscriber] of Object.entries(listeners)) {
        if (id === key) {
          console.log(event + "[dispatch]", key);
          await subscriber(data);
         // delete listeners[key];
        } else if (!id) {
          await subscriber(data);
         // delete listeners[key];
        }
      }
    }
  }

  sendMessage<
    E extends PreEvent.Event["event"],
    T extends Extract<PreEvent.Event, { event: E }>["data"]
  >(event: E, data: T) {
    const id = crypto.randomUUID();
    this.iframe!.contentWindow!.postMessage({ event, data, id }, this.url);

    return id;
  }

  safeContext<T extends () => Promise<any>>(fn: T) {
    if (this.iframe && this.connected && this.publicKey)
      return fn.bind(this)() as ReturnType<T>;
    else
      throw new WalletNotReadyError(
        "Please make sure wallet is connected successfully"
      );
  }
}
