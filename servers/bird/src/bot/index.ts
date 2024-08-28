import {
  Context,
  Input,
  Markup,
  type Middleware,
  type Telegraf,
} from "telegraf";

import { BotURL, readFileSync } from "../utils";
import type { Update } from "telegraf/typings/core/types/typegram";
import { createOrGetBotUser } from "../botUser.controller";

export const authenticationMiddleware =
  (): Middleware<Context<Update>> => async (context, next) => {
    const from = context.from!;

    const [user] = await createOrGetBotUser({
      id: String(from.id),
      username: from.username,
      chatId: String(context.message!.chat.id),
    });

    context.authUser = user;

    return next();
  };

const echo = (context: Context) => {
  context.replyWithPhoto(Input.fromLocalFile("./public/bot_start.png"), {
    caption: readFileSync("./src/bot/md/start.md", "utf-8"),
    parse_mode: "HTML",
    reply_markup: Markup.inlineKeyboard([
      Markup.button.webApp("Open Wallet", BotURL.launchURL),
    ]).reply_markup,
  });
};

export default function registerBot(bot: Telegraf) {
  bot.telegram.setMyCommands([
    {
      command: "/wallet",
      description: "My Wallet",
    },
  ]);

  bot.start(echo);
  bot.on("message", echo);
}
