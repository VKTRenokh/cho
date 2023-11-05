import * as discord from 'discord.js'
import { LoggerService } from '../logger/logger'
import { randomBytes } from 'node:crypto'
import { maybe } from 'src/monads/maybe/maybe'
import { intents, partials } from 'src/contsants/constants'
import { Command } from './commands/command'
import { MusicPlayer } from './music-player/music-player'

export class Bot {
  private client: discord.Client
  private player = new MusicPlayer()
  private rest: discord.REST
  private user = maybe<discord.ClientUser>(null)
  private logger = new LoggerService('Bot')

  constructor(
    token: string,
    private commands: Map<string, Command>,
  ) {
    this.logger.log('init')

    this.client = new discord.Client({
      intents,
      partials,
    })

    this.rest = new discord.REST({ version: '9' }).setToken(token)

    this.login(token)
  }

  private initHandlers() {
    this.client.on(discord.Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) {
        return
      }

      const command = maybe(this.commands.get(interaction.commandName) ?? null)

      await command.asyncMap(async (c) => await c.run(interaction, this.client))
    })

    this.client.on('messageCreate', (message) => {
      if (!message.content.startsWith('e!')) {
        return
      }

      const command = maybe(
        this.player.commands.get(
          message.content.slice(message.content.indexOf('!') + 1).split(' ')[0],
        ) ?? null,
      )

      command.map((c) => c(message))
    })

    this.logger.log('handlers inited')
  }

  private async putCommands(id: string) {
    await this.rest.put(discord.Routes.applicationCommands(id), {
      body: Array.from(this.commands, (v) => v[1].discordCommand),
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
