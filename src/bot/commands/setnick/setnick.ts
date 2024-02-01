import { CacheType, ChatInputCommandInteraction } from 'discord.js'
import { getGuildMembers } from 'src/utils/getGuildMembers'
import { maybe, mergeMap } from 'src/utils/maybe'

export const setnick = async (
  interaction: ChatInputCommandInteraction<CacheType>,
): Promise<void> => {
  const option = maybe(interaction.options.get('nickname'))

  const value = option
    .map((option) => option.value ?? null)
    .fmap(maybe)
    .map((value) => value.toString())

  const members = await getGuildMembers(maybe(interaction.guild))

  mergeMap(members, value, (members, value) => {
    members.forEach((member) => member.edit({ nick: value }))
  })
}
