import { Maybe } from 'src/monads/maybe/types/maybe'
import { CacheType, ChatInputCommandInteraction, Guild } from 'discord.js'
import { getGuildMembers } from 'src/utils/getGuildMembers'
import { getRandomMember } from 'src/utils/getRandomMember'
import { randomBytes } from 'node:crypto'
import { maybe } from 'src/monads/maybe/maybe'

export type Random = (
  guild: Maybe<Guild>,
  interaction: ChatInputCommandInteraction<CacheType>,
) => Promise<void> | void

export const random: Random[] = [
  async (guild) => {
    const members = await getGuildMembers(guild)

    const member = getRandomMember(members)

    member.map((m) => m.edit({ nick: randomBytes(4).toString('hex') }))
  },
  async (guild) => {
    guild.asyncMap(async (guild) => {
      return await guild.edit({
        description: randomBytes(100).toString('hex'),
      })
    })
  },
  async (guild) => {
    const members = await getGuildMembers(guild)

    const nickname = getRandomMember(members)
      .map((member) => member.nickname)
      .fmap(maybe)

    nickname.merge(guild).map((merged) => {
      merged[1].edit({
        name: merged[0],
      })
    })
  },
]
