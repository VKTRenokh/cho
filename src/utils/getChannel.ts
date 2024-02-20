import { type Guild } from 'discord.js'
import { M } from '@victorenokh/maybe.ts'

export const getChannel = async (guild: M.Maybe<Guild>, channelId: string) => {
  return (
    await guild.asyncMap(async (guild) => guild.channels.fetch(channelId))
  ).flatMap(M.of)
}
