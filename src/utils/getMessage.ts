import { Maybe } from 'src/monads/maybe/types/maybe'
import { type Guild, type Message } from 'discord.js'
import { maybe } from 'src/monads/maybe/maybe'
import { getChannel } from './getChannel'

export const getMessage = async (
  guild: Maybe<Guild>,
  channelId: string,
  messageId: string,
): Promise<Maybe<Message<true>>> => {
  const channel = await getChannel(guild, channelId)

  const message = await channel.asyncMap(async (channel) =>
    channel.isTextBased() ? channel.messages.fetch(messageId) : null,
  )

  return message.fmap(maybe)
}
