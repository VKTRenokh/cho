import { Maybe } from 'src/monads/maybe/types/maybe'
import { Guild } from 'discord.js'
import { getGuildMembers } from 'src/utils/getGuildMembers'
import { getRandomMember } from 'src/utils/getRandomMember'
import { randomBytes } from 'node:crypto'

export type Random = (guild: Maybe<Guild>) => Promise<void> | void

export const random: Random[] = [
  async (guild) => {
    const members = await getGuildMembers(guild)

    const member = getRandomMember(members)

    member.map((m) => m.edit({ nick: randomBytes(4).toString('hex') }))
  },
]
