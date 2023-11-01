"use strict";
import { configDotenv } from "dotenv";
import { Bot } from "./bot/bot";
import { commands } from "./bot/commands/commands";
import { LoggerService } from "./logger/logger";
const main = () => {
  const logger = new LoggerService("App");
  configDotenv();
  if (!process.env.TOKEN) {
    logger.error("no token");
    return;
  }
  const bot = new Bot(process.env.TOKEN, commands);
  process.on("SIGINT", async () => {
    await bot.destroy();
    process.exit();
  });
};
main();
