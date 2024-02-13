import { Message } from 'discord.js'
import { Maybe, undefinedToMaybe } from '@victorenokh/maybe.ts'

export const getLink = (message: Message<boolean>): Maybe<string> => {
  return undefinedToMaybe(message.content.split(' ').at(1))
}
