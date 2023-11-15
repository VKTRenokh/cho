import { type Guild } from 'discord.js'
import { maybe } from './maybe'
import { Maybe } from './types/maybe'

export const getChannel = async (guild: Maybe<Guild>, channelId: string) => {
  return (
    await guild.asyncMap(async (guild) => guild.channels.fetch(channelId))
  ).fmap(maybe)
}
