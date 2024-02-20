import { Client, SlashCommandBuilder } from 'discord.js'
import { Command } from './command.ts'
import { LoggerService } from 'src/logger/logger.ts'
import { sendhi } from './sendhi/sendhi.ts'
import { setnick } from './setnick/setnick.ts'
import { rofls } from './rofls/rofls.ts'
import { M } from '@victorenokh/maybe.ts'
import { Imagine } from './imagine/imagine.ts'
import { Fortune } from './fortune/fortune.ts'
import { MessagesChart } from './messages-chart/messages-chart.ts'
import { MaybeMap } from 'src/utils/maybe-map.ts'
import { Countdown } from './countdown/countdown.ts'

export class Commands {
  private logger = new LoggerService('Commands')
  public slashCommands = new MaybeMap<string, Command>([])
  private client = M.none<Client>()
  private messagesChart = new MessagesChart('chart')

  constructor() {
    this.logger.log('init')

    this.setCommands()

    this.slashCommands.set('imagine', new Imagine('imagine'))

    this.slashCommands.set('fortune', new Fortune('fortune'))

    this.slashCommands.set('chart', this.messagesChart)

    this.slashCommands.set('countdowntoigor', new Countdown('countdowntoigor'))
  }

  public setClient(client: Client) {
    if (this.client.value) {
      return
    }

    this.client = M.of(client)

    this.messagesChart.setClient(client)
  }

  public getCommandsJson() {
    return Array.from(
      this.slashCommands,
      (command) => command[1].discordCommand,
    )
  }

  public get size() {
    return this.slashCommands.size
  }

  public getCommand(key: string) {
    return this.slashCommands.getMaybe(key)
  }

  private setCommands() {
    this.slashCommands.set(
      'rofls',
      new Command(
        new SlashCommandBuilder()
          .setDescription('rofls')
          .setName('rofls')
          .toJSON(),
        rofls,
      ),
    )

    this.slashCommands.set(
      'sendhi',
      new Command(
        new SlashCommandBuilder()
          .setDescription('send hi')
          .setName('sendhi')
          .toJSON(),
        sendhi,
      ),
    )

    this.slashCommands.set(
      'setnicknameall',
      new Command(
        new SlashCommandBuilder()
          .setName('setnicknameall')
          .setDescription('set nickname for all people on this server')
          .addStringOption((option) =>
            option.setName('nickname').setDescription('nickname to set'),
          )
          .toJSON(),
        setnick,
      ),
    )
  }
}
