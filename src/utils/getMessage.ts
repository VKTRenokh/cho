import { type Guild, type Message } from 'discord.js'
import { getChannel } from './getChannel'
import { Maybe } from './types/maybe'
import { maybe } from './maybe'

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
