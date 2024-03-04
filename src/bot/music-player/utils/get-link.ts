import { Message } from 'discord.js'
import { E, M } from '@victorenokh/maybe.ts'

const validateIsLink = (link: string) => link.startsWith('https://')
const validateIsYoutubeLink = (link: string) =>
  link.startsWith('https://youtu.be') ||
  link.startsWith('https://www.youtube.com')

export const getLink = (
  message: Message<boolean>,
): E.Either<string, string> => {
  const link = M.fromUndefined(message.content.split(' ').at(1))

  return E.fromMaybe<string, string>(link, 'no link was provided')
    .ensureOrElse(validateIsLink, () => 'only links can be playable')
    .ensureOrElse(validateIsYoutubeLink, () => 'can play only youtube videos')
}
