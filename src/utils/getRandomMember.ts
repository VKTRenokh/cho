import { Collection, GuildMember } from 'discord.js'
import { randomInt } from 'node:crypto'
import { Maybe } from './types/maybe'
import { maybe } from './maybe'

export const getRandomMember = (
  members: Maybe<Collection<string, GuildMember>>,
): Maybe<GuildMember> => {
  return members.fmap((members) =>
    maybe(members.at(randomInt(members.size)) ?? null),
  )
}
