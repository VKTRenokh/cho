import { Message } from 'discord.js'

export const reply = (message: Message<boolean>) => (content: string) =>
  message.reply({ content })
