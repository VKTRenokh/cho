import {
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  type ChatInputCommandInteraction,
  type CacheType,
  type Client,
} from 'discord.js'

export class Command {
  constructor(
    public discordCommand: RESTPostAPIChatInputApplicationCommandsJSONBody,
    private handler: (
      interaction: ChatInputCommandInteraction<CacheType>,
      client: Client,
    ) => Promise<void> | void,
  ) {}

  public async run(
    interaction: ChatInputCommandInteraction<CacheType>,
    client: Client,
  ) {
    await this.handler(interaction, client)
  }
}
