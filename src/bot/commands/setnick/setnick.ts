import { CacheType, ChatInputCommandInteraction } from 'discord.js'
import { getStringOption } from 'src/utils/get-string-option'
import { getGuildMembers } from 'src/utils/getGuildMembers'
import { maybe, mergeMap } from '@victorenokh/maybe.ts'

const nickname = 'nickname'

export const setnick = async (
  interaction: ChatInputCommandInteraction<CacheType>,
): Promise<void> => {
  const members = await getGuildMembers(maybe(interaction.guild))

  mergeMap(
    members,
    getStringOption(interaction, nickname),
    (members, value) => {
      members.forEach((member) => member.edit({ nick: value }))
    },
  )
}
