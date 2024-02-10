import { ChatInputCommandInteraction } from 'discord.js'
import { LoggerService } from 'src/logger/logger'

export type Command = (
  logger: LoggerService,
  interaction: ChatInputCommandInteraction,
) => Promise<void>
