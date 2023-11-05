import { CacheType, ChatInputCommandInteraction } from 'discord.js'
import { LoggerService } from 'src/logger/logger'
import { random } from './random'
import { randomInt } from 'node:crypto'
import { maybe } from 'src/monads/maybe/maybe'

export const rofls = async (
  interaction: ChatInputCommandInteraction<CacheType>,
  logger: LoggerService,
): Promise<void> => {
  const index = randomInt(random.length)

  const rofl = random[index]

  await rofl(maybe(interaction.guild))

  logger.log(`rofl ${index}`)

  await interaction.reply({
    ephemeral: true,
    content: 'rofl executed',
    tts: true,
  })
}
