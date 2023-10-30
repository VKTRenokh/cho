import {
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  type ChatInputCommandInteraction,
  type CacheType,
  Client,
} from "discord.js";

export class Command {
  constructor(
    public discordCommand: RESTPostAPIChatInputApplicationCommandsJSONBody,
    private handler: (
      interaction: ChatInputCommandInteraction<CacheType>,
      client: Client,
    ) => void,
  ) {}

  public run(
    interaction: ChatInputCommandInteraction<CacheType>,
    client: Client,
  ) {
    this.handler(interaction, client);
  }
}
