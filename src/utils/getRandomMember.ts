import { Collection, GuildMember } from 'discord.js'
import { randomInt } from 'node:crypto'
import { Maybe } from '@victorenokh/maybe.ts'

export const getRandomMember = (
  members: Maybe<Collection<string, GuildMember>>,
): Maybe<GuildMember> => {
  return members.mapNullable((members) => members.at(randomInt(members.size)))
}
