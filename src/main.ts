import { configDotenv } from 'dotenv'
import { createBot } from './create-bot'

const main = (): void => {
  configDotenv()

  const bot = createBot()

  process.on('uncaughtException', (e) => console.warn(e))
  process.on('unhandledRejection', (e) => console.error(e))
  process.on('SIGINT', async () => {
    await bot.destroy()
    process.exit()
  })
}

main()
