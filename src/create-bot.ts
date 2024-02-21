import { Bot } from './bot/bot'
import { getToken } from './utils/get-token'

export const createBot = () =>
  getToken().fold(
    (e) => {
      console.error(e)
      process.exit(0)
    },
    (token) => new Bot(token),
  )
