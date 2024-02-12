import { type Guild } from 'discord.js'
import { Maybe, maybe } from './maybe'

export const getChannel = async (guild: Maybe<Guild>, channelId: string) => {
  return (
    await guild.asyncMap(async (guild) => guild.channels.fetch(channelId))
  ).flatMap(maybe)
}
