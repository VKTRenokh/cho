import {
  CacheType,
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
} from 'discord.js'
import { Command } from '../command'
import { exec } from 'child_process'

export class Fortune extends Command {
  constructor(key: string) {
    super(
      new SlashCommandBuilder()
        .setName(key)
        .setDescription('fortune command in linux')
        .toJSON(),
    )
  }

  public async run(
    interaction: ChatInputCommandInteraction<CacheType>,
    _: Client<boolean>,
  ): Promise<void> {
    exec('fortune', (err, stdout) => {
      if (err) {
        this.logger.log(err.toString())
        return
      }

      interaction.reply({ content: stdout.toString() })
    })
  }
}
