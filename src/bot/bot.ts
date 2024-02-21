import {
  Client,
  REST,
  ClientUser,
  Events,
  Routes,
  Message,
  GuildEmoji,
} from 'discord.js'
import { LoggerService } from '../logger/logger'
import { E, M } from '@victorenokh/maybe.ts'
import { intents, partials } from 'src/contsants/constants'
import { Command, MusicPlayer } from './music-player/music-player'
import { Commands } from './commands/commands'
import { splitWithModifier } from 'src/utils/splitWithModifier'
import { brilliantEmoteId } from './constants/emotes'

export class Bot {
  private client: Client
  private player = new MusicPlayer()
  private rest: REST
  private user = M.none<ClientUser>()
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

  private reactWithBrilliantEmote(message: Message) {
    if (!(Math.random() > 0.99)) {
      return
    }

    const emoji = this.client.emojis.cache.get(brilliantEmoteId)
    const react = (emoji: GuildEmoji) => message.react(emoji)

    M.fromUndefined(emoji).map(react)
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
      this.reactWithBrilliantEmote(message)

      if (!message.content.startsWith(this.playerModifier)) {
        return
      }

      const splitted = splitWithModifier(message.content, '!')

      const command = this.player.getCommand(splitted[0])

      E.fromMaybe<string, Command>(
        command,
        `unknown player command. Available commands are: ${this.player.getCommandsString()}`,
      ).fold(
        (error) => (message.reply({ content: error }), undefined),
        (fn) => fn(message),
      )
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

      this.user = M.of(this.client.user)

      await this.createCommands()

      this.commands.setClient(this.client)

      this.logger.log(`bot login ${performance.now() - start}ms`)
    } catch (e) {
      this.logger.error('something went wrong when trying to login')
    }
  }

  public async destroy(): Promise<void> {
    await this.client.destroy()
    // this.player.destroy()
  }
}
