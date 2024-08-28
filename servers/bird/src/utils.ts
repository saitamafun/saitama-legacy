import { ZodError } from "zod";
import type { Context } from "telegraf";
import { encodeParams } from "@saitamafun/wallet/lib";
import { type PathOrFileDescriptor, readFileSync as read } from "fs";

import { APP_URL, RPC_URL, SAITAMA_ACCESS_TOKEN } from "./config";

export function cleanText(value: string) {
  return value
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\~/g, "\\~")
    .replace(/\>/g, "\\>")
    .replace(/\#/g, "\\#")
    .replace(/\+/g, "\\+")
    .replace(/\-/g, "\\-")
    .replace(/\=/g, "\\=")
    .replace(/\|/g, "\\|")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\./g, "\\.")
    .replace(/\!/g, "\\!");
}

export function readFileSync(...params: Parameters<typeof read>): string;
export function readFileSync(descriptor: PathOrFileDescriptor): string;
export function readFileSync(
  descriptor: PathOrFileDescriptor,
  ...args: any[]
): string {
  if (args.length === 0) {
    const text = read(descriptor, "utf-8") as string;
    return cleanText(text);
  }

  return read(descriptor, ...args) as unknown as string;
}

export const catchRuntimeError = <T extends (context: Context) => Promise<any>>(
  func: T
) => {
  return (context: Context) =>
    func(context).catch((error) => {
      if (error instanceof ZodError)
        return context.replyWithMarkdownV2(
          cleanText("`" + JSON.stringify(error.format(), undefined, 2) + "`")
        );
      return context.replyWithMarkdownV2(cleanText("`" + error.message + "`"));
    });
};

export const privateChatOnly =
  <T extends (context: Context) => Promise<any>>(func: T) =>
  async (context: Context) => {
    await context.telegram.deleteMyCommands();

    if (context.message && "type" in context.message.chat) {
      const type = context.message.chat.type;
      if (type === "private") return func(context);
      return context.replyWithMarkdownV2(
        "This command is for private chat only"
      );
    }
  };

export const BotURL = {
  launchURL:
    APP_URL +
    "?hash=" +
    encodeParams({ accessToken: SAITAMA_ACCESS_TOKEN, rpcEndpoint: RPC_URL }),
};
