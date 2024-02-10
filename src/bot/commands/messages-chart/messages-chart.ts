import {
  CacheType,
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
} from 'discord.js'
import { Command } from '../command'
import { maybe } from 'src/utils/maybe'

export class MessagesChart extends Command {
  private chart = new Map<string, number>()

  constructor(key: string) {
    super(
      new SlashCommandBuilder()
        .setName(key)
        .setDescription('show messages chart')
        .toJSON(),
    )
  }

  private createOrIncremnt(id: string) {
    const stats = this.chart.get(id)

    if (!stats) {
      this.chart.set(id, 1)
      return
    }

    this.chart.set(id, stats + 1)
  }

  private listenMessages(client: Client) {
    client.on('messageCreate', (message) => {
      if (message.author.bot) {
        return
      }

      this.createOrIncremnt(message.author.id)
    })
  }

  public setClient(client: Client) {
    this.listenMessages(client)
  }

  public async run(
    interaction: ChatInputCommandInteraction<CacheType>,
    client: Client<boolean>,
  ): Promise<void> {
    const entries = Array.from(this.chart.entries())

    const statWithNicks = (
      await Promise.all(
        entries.map(async ([id, stat]) => {
          const user = await client.users.fetch(id)

          return { name: user.displayName, stat }
        }),
      )
    ).sort((a, b) => b.stat - a.stat)

    const message = statWithNicks.reduce((acc, curr) => {
      return acc + `${curr.name} - ${curr.stat}\n`
    }, '')

    interaction.reply({ content: message })
  }
}
