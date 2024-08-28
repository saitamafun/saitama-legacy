import Fastify from "fastify";
import { Telegraf, session } from "telegraf";

import { TELEGRAM_ACCESS_TOKEN } from "./config";
import registerBot, { authenticationMiddleware } from "./bot";

function createBot() {
  const bot = new Telegraf(TELEGRAM_ACCESS_TOKEN);

  bot.use(session());
  bot.use(authenticationMiddleware());

  return bot;
}

const createFastifyInstance = () => {
  const fastify = Fastify({
    logger: true,
    ignoreDuplicateSlashes: true,
    ignoreTrailingSlash: true,
  });

  return fastify;
};

async function main() {
  const bot = createBot();
  const fastify = createFastifyInstance();

  registerBot(bot);

  const tasks: Promise<any>[] = [];

  if ("RENDER_EXTERNAL_HOSTNAME" in process.env) {
    const webhook = await bot.createWebhook({
      domain: process.env.RENDER_EXTERNAL_HOSTNAME!,
    });

    /** @ts-expect-error */
    fastify.post(`/telegraf/${bot.secretPathComponent()}`, webhook);
  } else tasks.push(bot.launch());

  registerBot(bot);

  tasks.push(
    fastify.listen({ port: Number(process.env.PORT!), host: process.env.HOST! })
  );

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));

  await Promise.all(tasks);
}

main().catch(console.log);
