import { CacheType, ChatInputCommandInteraction } from 'discord.js'
import { getStringOption } from 'src/utils/get-string-option'
import { getGuildMembers } from 'src/utils/getGuildMembers'
import { M } from '@victorenokh/maybe.ts'

const nickname = 'nickname'

export const setnick = async (
  interaction: ChatInputCommandInteraction<CacheType>,
): Promise<void> => {
  const members = await getGuildMembers(M.of(interaction.guild))

  M.mergeMap(
    members,
    getStringOption(interaction, nickname),
    (members, value) => {
      members.forEach((member) => member.edit({ nick: value }))
    },
  )
}
