import { SlashCommandBuilder } from 'discord.js'
import { Command } from './command.ts'
import { LoggerService } from 'src/logger/logger.ts'
import { sendhi } from './sendhi/sendhi.ts'
import { setnick } from './setnick/setnick.ts'
import { rofls } from './rofls/rofls.ts'

export class Commands {
  private logger = new LoggerService('Commands')

  constructor() {
    this.logger.log('init')
  }
}

const logger = new LoggerService('Commands')
export const commands = new Map<string, Command>()

commands.set(
  'rofls',
  new Command(
    new SlashCommandBuilder().setDescription('rofls').setName('rofls').toJSON(),
    rofls,
  ),
)

commands.set(
  'sendhi',
  new Command(
    new SlashCommandBuilder()
      .setDescription('send hi')
      .setName('sendhi')
      .toJSON(),
    sendhi,
  ),
)

commands.set(
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

logger.log('init')
