import * as discord from 'discord.js'
import { LoggerService } from '../logger/logger'
import { randomBytes } from 'node:crypto'
import { maybe } from 'src/monads/maybe/maybe'
import { intents, partials } from 'src/contsants/constants'
import { Command } from './commands/command'
import { MusicPlayer } from './music-player/music-player'

export class Bot {
  client: discord.Client
  player = new MusicPlayer()
  rest: discord.REST
  user = maybe<discord.ClientUser>(null)
  logger = new LoggerService('Bot')

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

    // //{{{ WARN: REFACTOR THIS SHIT
    // this.client.on(discord.Events.InteractionCreate, async (interaction) => {
    //   this.logger.log(`interaction create`);
    //
    //   if (interaction.isModalSubmit()) {
    //     this.logger.log(`interaction modal (${interaction.customId})`);
    //
    //     if (!(interaction.customId === "igorstrimit?")) {
    //       return;
    //     }
    //
    //     interaction.guild?.voiceStates.cache.map((voiceState) => {
    //       voiceState.setChannel("1139639067559084205");
    //     });
    //
    //     await interaction.reply({
    //       content: "true",
    //       ephemeral: true,
    //     });
    //   }
    //
    //   if (!interaction.isChatInputCommand()) {
    //     return;
    //   }
    //
    //   this.logger.log(
    //     `interaction chat input command (${interaction.commandName})`,
    //   );
    //
    //   if (interaction.commandName === "pokezhmodal") {
    //     const modal = new discord.ModalBuilder()
    //       .setCustomId("igorstrimit?")
    //       .setTitle("Question?!!!?!?!!?");
    //
    //     const textInput = new discord.TextInputBuilder()
    //       .setCustomId("igorsmotritstrim")
    //       .setRequired(true)
    //       .setLabel("игорь смотрит стрим?")
    //       .setStyle(discord.TextInputStyle.Paragraph);
    //
    //     const action =
    //       new discord.ActionRowBuilder<discord.TextInputBuilder>().setComponents(
    //         textInput,
    //       );
    //
    //     modal.setComponents(action);
    //
    //     await interaction.showModal(modal);
    //   }
    //
    //   if (interaction.commandName === "rofls") {
    //     if (!interaction.guild) {
    //       return;
    //     }
    //
    //     const commands = [
    //       async () => {
    //         if (
    //           !this.client ||
    //           !interaction.guildId ||
    //           !interaction.channelId
    //         ) {
    //           return;
    //         }
    //
    //         const guild = await this.client.guilds.fetch(interaction.guildId);
    //
    //         if (!guild) {
    //           this.logger.warn("no guild");
    //         }
    //
    //         const channel = await guild.channels.fetch(interaction.channelId);
    //
    //         if (!channel) {
    //           this.logger.warn("no channel");
    //           return;
    //         }
    //
    //         channel.setName(randomBytes(5).toString("base64"));
    //       },
    //       async () => {
    //         if (
    //           !this.client ||
    //           !interaction.guildId ||
    //           !interaction.channelId
    //         ) {
    //           return;
    //         }
    //
    //         const guild = await this.client.guilds.fetch(interaction.guildId);
    //
    //         if (!guild) {
    //           this.logger.warn("no guild");
    //         }
    //
    //         const channel = await guild.channels.fetch(interaction.channelId);
    //
    //         if (!channel || !channel.isVoiceBased()) {
    //           this.logger.warn("no channel");
    //           return;
    //         }
    //
    //         channel.clone({
    //           name: `${channel.name} clone`,
    //         });
    //       },
    //       async () => {
    //         if (
    //           !this.client ||
    //           !interaction.guildId ||
    //           !interaction.channelId
    //         ) {
    //           return;
    //         }
    //
    //         const guild = await this.client.guilds.fetch(interaction.guildId);
    //
    //         if (!guild) {
    //           this.logger.warn("no guild");
    //         }
    //
    //         const channel = await guild.channels.fetch(interaction.channelId);
    //
    //         if (!channel || !channel.isVoiceBased()) {
    //           this.logger.warn("no channel");
    //           return;
    //         }
    //
    //         channel.setNSFW(Math.random() > 0.5);
    //       },
    //       async () => {
    //         if (
    //           !this.client ||
    //           !interaction.guildId ||
    //           !interaction.channelId
    //         ) {
    //           return;
    //         }
    //
    //         interaction.guild?.voiceStates.cache.forEach((voice) => {
    //           voice.setDeaf();
    //         });
    //       },
    //       async () => {
    //         if (
    //           !this.client ||
    //           !interaction.guildId ||
    //           !interaction.channelId
    //         ) {
    //           return;
    //         }
    //
    //         interaction.guild?.voiceStates.cache.forEach((voice) => {
    //           voice.setMute();
    //         });
    //       },
    //       async () => {
    //         if (
    //           !this.client ||
    //           !interaction.guildId ||
    //           !interaction.channelId
    //         ) {
    //           return;
    //         }
    //
    //         interaction.guild?.voiceStates.cache.forEach((voice) => {
    //           voice.disconnect();
    //         });
    //       },
    //       async () => {
    //         if (
    //           !this.client ||
    //           !interaction.guildId ||
    //           !interaction.channelId
    //         ) {
    //           return;
    //         }
    //
    //         const voiceStatesLength = interaction.guild?.voiceStates.cache.size;
    //
    //         if (!voiceStatesLength) {
    //           this.logger.warn("no voice states length");
    //           return;
    //         }
    //
    //         this.logger.log(`voice states length ${voiceStatesLength}`);
    //
    //         interaction.guild?.voiceStates.cache
    //           .at((Math.random() * voiceStatesLength) | 0)
    //           ?.disconnect();
    //       },
    //       async () => {
    //         if (
    //           !this.client ||
    //           !interaction.guildId ||
    //           !interaction.channelId
    //         ) {
    //           return;
    //         }
    //
    //         const voiceStatesLength = interaction.guild?.voiceStates.cache.size;
    //
    //         if (!voiceStatesLength) {
    //           this.logger.warn("no voice states length");
    //           return;
    //         }
    //
    //         this.logger.log(`voice states length ${voiceStatesLength}`);
    //
    //         interaction.guild?.voiceStates.cache
    //           .at((Math.random() * voiceStatesLength) | 0)
    //           ?.setMute();
    //       },
    //     ];
    //
    //     const roflIndex = (Math.random() * commands.length) | 0;
    //
    //     try {
    //       this.logger.log(`rofls command call (${roflIndex})`);
    //
    //       await commands[roflIndex]();
    //
    //       interaction.reply({
    //         content: "sneaky rofl was executed",
    //         ephemeral: true,
    //       });
    //     } catch (e) {
    //       this.logger.error(
    //         `something went wrong when executing rofls command (${roflIndex}) ${e}`,
    //       );
    //     }
    //   }
    //
    //   if (interaction.commandName === "sendhitoraji") {
    //     if (!this.client) {
    //       return;
    //     }
    //
    //     const guild = await this.client.guilds.fetch(legendaryServerId);
    //
    //     if (!guild) {
    //       return;
    //     }
    //
    //     const channel = await guild.channels.fetch(legendaryChannelId);
    //
    //     if (!channel || !channel.isTextBased()) {
    //       return;
    //     }
    //
    //     const message = await channel.messages.fetch(legendaryRajiSlideId);
    //
    //     if (!message) {
    //       return;
    //     }
    //     const stickers = await this.client.fetchPremiumStickerPacks();
    //
    //     const stickerPack = stickers.get("847201503668207738");
    //
    //     if (!stickerPack) {
    //       this.logger.warn("no sticker pack");
    //       return;
    //     }
    //
    //     const sticker = stickerPack.stickers.get("781291131828699156");
    //
    //     if (!sticker) {
    //       this.logger.warn("no sticker");
    //       return;
    //     }
    //
    //     await message.reply({
    //       stickers: [sticker],
    //     });
    //
    //     await message.reply({
    //       stickers: [sticker],
    //     });
    //
    //     interaction.reply({
    //       content: "привет was send!",
    //       ephemeral: true,
    //     });
    //   }
    // });
    // //}}}

    this.login(token)
  }

  initHandlers() {
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

  async putCommands(id: string) {
    await this.rest.put(discord.Routes.applicationCommands(id), {
      body: Array.from(this.commands, (v) => v[1].discordCommand),
    })
  }

  async createCommands() {
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

  async destroy(): Promise<void> {
    await this.client.destroy()
    this.player.destroy()
  }
}
