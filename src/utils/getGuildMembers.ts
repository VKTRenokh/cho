import { Guild, Collection, GuildMember } from 'discord.js'
import { Maybe } from '@victorenokh/maybe.ts'

export const getGuildMembers = async (
  guild: Maybe<Guild>,
): Promise<Maybe<Collection<string, GuildMember>>> => {
  return await guild
    .map((guild) => guild.members)
    .asyncMap(async (members) => members.fetch())
}
