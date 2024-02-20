import { Guild, Collection, GuildMember } from 'discord.js'
import { M } from '@victorenokh/maybe.ts'

export const getGuildMembers = async (
  guild: M.Maybe<Guild>,
): Promise<M.Maybe<Collection<string, GuildMember>>> => {
  return await guild
    .map((guild) => guild.members)
    .asyncMap(async (members) => members.fetch())
}
