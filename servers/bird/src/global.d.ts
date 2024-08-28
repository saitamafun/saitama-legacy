import { createOrGetBotUser } from "./bot/botUser.controller";

type BotUser = NonNullable<
  Awaited<ReturnType<typeof createOrGetBotUser>>
>[number];

declare module "telegraf" {
  interface Context {
    authUser: BotUser;
  }
}
