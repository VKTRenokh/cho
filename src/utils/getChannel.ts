import { type Maybe } from 'src/monads/maybe/types/maybe'
import { type Guild } from 'discord.js'
import { maybe } from 'src/monads/maybe/maybe'

export const getChannel = async (guild: Maybe<Guild>, channelId: string) => {
  return (
    await guild.asyncMap(async (guild) => guild.channels.fetch(channelId))
  ).fmap(maybe)
}
