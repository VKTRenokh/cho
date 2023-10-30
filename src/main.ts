import { Bot } from "./bot/bot";
import { commands } from "./bot/commands/commands";
import { LoggerService } from "./logger/logger";

const main = (): void => {
  const logger = new LoggerService("App");

  if (!Bun.env.TOKEN) {
    logger.error("no token");

    return;
  }

  const bot = new Bot(Bun.env.TOKEN, commands);

  process.on("SIGINT", async () => {
    await bot.destroy();
    process.exit();
  });
};

main();
