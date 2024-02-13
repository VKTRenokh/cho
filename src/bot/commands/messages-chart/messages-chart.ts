import {
  CacheType,
  ChatInputCommandInteraction,
  Client,
  Events,
  SlashCommandBuilder,
} from 'discord.js'
import { Command } from '../command'
import { Charts } from './enums/charts'
import { MaybeMap } from 'src/utils/maybe-map'
import { getStringOption } from 'src/utils/get-string-option'
import { Maybe } from '@victorenokh/maybe.ts'

type Chart = Map<string, number>

const charts = new MaybeMap<string, Chart>([
  [Charts.Messages, new Map<string, number>()],
  [Charts.Commands, new Map<string, number>()],
])

const chartKey = 'chart'

export class MessagesChart extends Command {
  private charts = charts

  constructor(key: string) {
    const options = Array.from(charts.keys()).map((key) => ({
      name: key,
      value: key,
    }))

    super(
      new SlashCommandBuilder()
        .setName(key)
        .setDescription('show messages chart')
        .addStringOption((option) =>
          option
            .setName(chartKey)
            .setDescription('which chart to show')
            .setChoices(...options),
        )
        .toJSON(),
    )
  }

  private createOrIncrement(id: string, chart: Chart) {
    const stats = chart.get(id)

    if (!stats) {
      chart.set(id, 1)
      return
    }

    chart.set(id, stats + 1)
  }

  private listenMessages(client: Client) {
    client.on('messageCreate', (message) => {
      if (message.author.bot) {
        return
      }

      this.charts.getMaybe(Charts.Messages).map((chart) => {
        this.createOrIncrement(message.author.id, chart)
      })
    })

    client.on(Events.InteractionCreate, (interaction) => {
      if (!interaction.isChatInputCommand()) {
        return
      }

      this.charts
        .getMaybe(Charts.Commands)
        .map((chart) => this.createOrIncrement(interaction.user.id, chart))
    })
  }

  public setClient(client: Client) {
    this.listenMessages(client)
  }

  private getStatWithNicks(entries: Maybe<[string, number][]>, client: Client) {
    return entries.asyncMap(async (entries) => {
      const awaited = await Promise.all(
        entries.map(async ([id, stat]) => {
          const user = await client.users.fetch(id)

          return { name: user.displayName, stat }
        }),
      )

      return awaited.sort((a, b) => b.stat - a.stat)
    })
  }

  private sendStat(
    interaction: ChatInputCommandInteraction,
    stat: { name: string; stat: number }[],
  ) {
    const message = stat.reduce((acc, curr) => {
      return acc + `${curr.name} - ${curr.stat}\n`
    }, '')

    interaction.reply({ content: message })
  }

  public async run(
    interaction: ChatInputCommandInteraction<CacheType>,
    client: Client<boolean>,
  ): Promise<void> {
    const chart = getStringOption(interaction, chartKey).getOrElse(
      Charts.Messages,
    )

    const entries = this.charts
      .getMaybe(chart)
      .map((chart) => Array.from(chart.entries()))

    const statWithNicks = await this.getStatWithNicks(entries, client)

    statWithNicks.map((stat) => this.sendStat(interaction, stat))
  }
}
