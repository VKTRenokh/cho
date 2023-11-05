import { Maybe } from 'src/monads/maybe/types/maybe'
import { type Guild, type Message } from 'discord.js'
import { maybe } from 'src/monads/maybe/maybe'

const getChannel = async (guild: Maybe<Guild>, channelId: string) => {
  return (
    await guild.asyncMap(async (guild) => guild.channels.fetch(channelId))
  ).fmap(maybe)
}

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
