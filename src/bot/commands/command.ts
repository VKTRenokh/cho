import {
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  type ChatInputCommandInteraction,
  type CacheType,
  type Client,
} from 'discord.js'
import { LoggerService } from 'src/logger/logger'

export class Command {
  private logger = new LoggerService(this.discordCommand.name)

  constructor(
    public discordCommand: RESTPostAPIChatInputApplicationCommandsJSONBody,
    private handler: (
      interaction: ChatInputCommandInteraction<CacheType>,
      logger: LoggerService,
      client: Client,
    ) => Promise<void> | void,
  ) {}

  public async run(
    interaction: ChatInputCommandInteraction<CacheType>,
    client: Client,
  ) {
    this.logger.log('run')
    await this.handler(interaction, this.logger, client)
  }
}
