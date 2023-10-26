import { Bot } from "./bot/bot";

const bot = new Bot();

process.on("SIGINT", async () => {
  await bot.destroy();
  process.exit();
});
