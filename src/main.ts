import { configDotenv } from 'dotenv'
import { Bot } from './bot/bot'
import { LoggerService } from './logger/logger'

const main = (): void => {
  const logger = new LoggerService('App')

  configDotenv()

  if (!process.env.TOKEN) {
    logger.error('no token')
    return
  }

  const bot = new Bot(process.env.TOKEN)

  process.on('uncaughtException', (e) => {
    logger.warn(`uncaughtException: ${e}`)
  })

  process.on('unhandledRejection', (e) => {
    logger.warn(`unhandledRejection: ${e}`)
  })

  process.on('SIGINT', async () => {
    await bot.destroy()
    process.exit()
  })
}

main()
