import { CacheType, ChatInputCommandInteraction } from 'discord.js'
import { LoggerService } from 'src/logger/logger'
import { random } from './random'
import { maybeKick } from './maybeKick'
import { randomInt } from 'node:crypto'
import { maybe } from '@victorenokh/maybe.ts'

export const rofls = async (
  interaction: ChatInputCommandInteraction<CacheType>,
  logger: LoggerService,
): Promise<void> => {
  if (await maybeKick(interaction, logger)) {
    return
  }

  const index = randomInt(random.length)

  const rofl = random[index]

  await rofl(maybe(interaction.guild), interaction)

  logger.log(`rofl ${index}`)

  await interaction.reply({
    content: 'rofl executed',
    ephemeral: true,
  })
}
