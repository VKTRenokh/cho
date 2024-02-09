import { Message } from 'discord.js'
import { Maybe, undefinedToMaybe } from 'src/utils/maybe'

export const getLink = (message: Message<boolean>): Maybe<string> => {
  return undefinedToMaybe(message.content.split(' ').at(1))
}
