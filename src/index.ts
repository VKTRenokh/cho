import * as dotenv from "dotenv";
import { Bot } from "./bot/bot";
import { LoggerService } from "./logger/logger";

const logger = new LoggerService("App", 3);

process.on("uncaughtException", (reason) => {
  logger.error(reason);
});

process.on("unhandledRejection", (reason) => {
  logger.error(reason);
});

dotenv.config();
logger.log("dotenv config");

const bot = new Bot();

process.on("SIGINT", async () => {
  logger.log("stopping app (SIGINT)");
  await bot.destroy();
  logger.log("app stopped");
  process.exit();
});
