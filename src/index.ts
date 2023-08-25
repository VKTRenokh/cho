import * as dotenv from "dotenv";
import { Bot } from "./bot/bot";
import { LoggerService } from "./logger/logger";

const logger = new LoggerService("App", 3);

process.on("uncaughtException", (reason) => {
  logger.error(reason);
});

dotenv.config();
logger.log("dotenv config");

new Bot();
