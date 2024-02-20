import { type Guild, type Message } from 'discord.js'
import { getChannel } from './getChannel'
import { M } from '@victorenokh/maybe.ts'

export const getMessage = async (
  guild: M.Maybe<Guild>,
  channelId: string,
  messageId: string,
): Promise<M.Maybe<Message<true>>> => {
  const channel = await getChannel(guild, channelId)

  const message = await channel.asyncMap(async (channel) =>
    channel.isTextBased() ? channel.messages.fetch(messageId) : null,
  )

  return message.flatMap(M.of)
}
