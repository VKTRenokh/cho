import { CacheType, ChatInputCommandInteraction } from 'discord.js'
import { getGuildMembers } from 'src/utils/getGuildMembers'
import { maybe } from 'src/utils/maybe'

export const setnick = async (
  interaction: ChatInputCommandInteraction<CacheType>,
): Promise<void> => {
  const option = maybe(interaction.options.get('nickname'))

  const value = option
    .map((option) => option.value ?? null)
    .fmap(maybe)
    .map((value) => value.toString())

  const members = await getGuildMembers(maybe(interaction.guild))

  members.merge(value).map((merged) => {
    merged[0].forEach((member) => member.edit({ nick: merged[1] }))

    interaction.reply({ content: 'changed nicknames', ephemeral: true })
  })
}
