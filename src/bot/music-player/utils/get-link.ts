import { Message } from 'discord.js'
import { Maybe, undefinedToMaybe } from '@victorenokh/maybe.ts'

export const getLink = (message: Message<boolean>): Maybe<string> => {
  console.log('!!', message.content)
  return undefinedToMaybe(message.content.split(' ').at(1))
}
