import {
  CacheType,
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
} from 'discord.js'
import { Command } from '../command'
import { dateDifference } from 'src/utils/date-difference'

export class Countdown extends Command {
  private readonly date = new Date('22 april 2024')

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
  ): Promise<void> {
    const difference = dateDifference(new Date(), this.date)

    interaction.reply({
      content: `in ${difference.days} days ${difference.hours} hours ${difference.minutes} minutes ${difference.seconds} seconds : )`,
    })
  }
}
