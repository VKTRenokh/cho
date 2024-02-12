import {
  CacheType,
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
} from 'discord.js'
import { Command } from '../command'

export class Countdown extends Command {
  constructor(key: string) {
    super(
      new SlashCommandBuilder()
        .setName(key)
        .setDescription('countdown to 22 april')
        .toJSON(),
    )
  }

  public async run(
    interaction: ChatInputCommandInteraction<CacheType>,
    client: Client<boolean>,
  ): Promise<void> {}
}
