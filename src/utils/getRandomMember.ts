import { Collection, GuildMember } from 'discord.js'
import { randomInt } from 'node:crypto'
import { M } from '@victorenokh/maybe.ts'

export const getRandomMember = (
  members: M.Maybe<Collection<string, GuildMember>>,
): M.Maybe<GuildMember> => {
  return members.mapNullable((members) => members.at(randomInt(members.size)))
}
