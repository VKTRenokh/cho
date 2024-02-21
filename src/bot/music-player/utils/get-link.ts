import { Message } from 'discord.js'
import { M } from '@victorenokh/maybe.ts'

export const getLink = (message: Message<boolean>): M.Maybe<string> =>
  M.fromUndefined(message.content.split(' ').at(1))
