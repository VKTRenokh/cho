import { Collection, GuildMember } from 'discord.js'
import { Maybe } from 'src/monads/maybe/types/maybe'
import { randomInt } from 'node:crypto'
import { maybe } from 'src/monads/maybe/maybe'

export const getRandomMember = (
  members: Maybe<Collection<string, GuildMember>>,
): Maybe<GuildMember> => {
  return members.fmap((members) =>
    maybe(members.at(randomInt(members.size)) ?? null),
  )
}
