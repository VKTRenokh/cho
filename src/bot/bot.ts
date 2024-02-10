import { Client, REST, ClientUser, Events, Routes } from 'discord.js'
import { LoggerService } from '../logger/logger'
import { randomBytes } from 'node:crypto'
import { maybe, undefinedToMaybe } from 'src/utils/maybe'
import { intents, partials } from 'src/contsants/constants'
import { MusicPlayer } from './music-player/music-player'
import { Commands } from './commands/commands'
import { splitWithModifier } from 'src/utils/splitWithModifier'

export class Bot {
  private client: Client
  private player = new MusicPlayer()
  private rest: REST
  private user = maybe<ClientUser>(null)
  private logger = new LoggerService('Bot')
  private commands = new Commands()
  private readonly playerModifier = 'e!'

  constructor(token: string) {
    this.logger.log('init')

    this.client = new Client({
      intents,
      partials,
    })

    this.rest = new REST({ version: '9' }).setToken(token)

    this.login(token)
  }

  private initHandlers() {
    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) {
        return
      }

      const command = this.commands.getCommand(interaction.commandName)

      await command.asyncMap(
        async (command) => await command.run(interaction, this.client),
      )
    })

    this.client.on('messageCreate', (message) => {
      if (Math.random() > 0.99) {
        undefinedToMaybe(
          this.client.emojis.cache.get('1202571355443306516'),
        ).map((emoji) => message.react(emoji))
      }

      if (!message.content.startsWith(this.playerModifier)) {
        return
      }

      const splitted = splitWithModifier(message.content, '!')

      const command = this.player.getCommand(splitted[0])

      command.map((fn) => fn(message))
    })

    this.logger.log('handlers inited')
  }

  private async putCommands(id: string) {
    await this.rest.put(Routes.applicationCommands(id), {
      body: this.commands.getCommandsJson(),
    })
  }

  private async createCommands() {
    try {
      await this.user.asyncMap(async (user) => await this.putCommands(user.id))

      this.initHandlers()

      this.logger.log(`registered commands '${this.commands.size}'`)
    } catch (e) {
      this.logger.error(
        `something went wrong when trying to create slash commands ${e}`,
      )
    }
  }

  public async changeNickname(nickname: string) {
    try {
      return await this.user.asyncMap(
        async (u) => await u.setUsername(nickname),
      )
    } catch (e) {}
  }

  public async login(token: string) {
    try {
      const start = performance.now()

      this.logger.log('bot login start')

      await this.client.login(token)

      this.user = maybe(this.client.user)

      this.changeNickname(
        `(.. 'Choooooo', 'bot') ${randomBytes(2).toString('hex')}`,
      )

      await this.createCommands()

      this.logger.log(`bot login ${performance.now() - start}ms`)
    } catch (e) {
      this.logger.error('something went wrong when trying to login')
    }
  }

  public async destroy(): Promise<void> {
    await this.client.destroy()
    this.player.destroy()
  }
}
