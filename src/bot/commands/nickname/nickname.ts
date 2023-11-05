import { CacheType, ChatInputCommandInteraction } from 'discord.js'
import { LoggerService } from 'src/logger/logger'
import { maybe } from 'src/monads/maybe/maybe'
import { getGuildMembers } from 'src/utils/getGuildMembers'

export const nickname = async (
  logger: LoggerService,
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

    logger.log('edit')

    interaction.reply({ content: 'changed nicknames', ephemeral: true })
  })
}
