import { SlashCommandBuilder } from 'discord.js'
import { Command } from './command.ts'
import { LoggerService } from 'src/logger/logger.ts'
import { sendhi } from './sendhi/sendhi.ts'
import { setnick } from './setnick/setnick.ts'
import { rofls } from './rofls/rofls.ts'
import { maybe } from 'src/utils/maybe.ts'
import { Imagine } from './imagine/imagine.ts'

export class Commands {
  private logger = new LoggerService('Commands')
  public slashCommands = new Map<string, Command>()

  constructor() {
    this.logger.log('init')

    this.setCommands()

    this.slashCommands.set('imagine', new Imagine('imagine'))
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
    return maybe(this.slashCommands.get(key) ?? null)
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
