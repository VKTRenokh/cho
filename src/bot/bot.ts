import * as discord from "discord.js";
import * as discordVoice from "@discordjs/voice";
import { Partials } from "discord.js";
import {
  rajiId,
  animeGreetingGifUrl,
  legendaryServerId,
  legendaryChannelId,
  legendaryRajiSlideId,
} from "../contsants/constants";
import { Player } from "./player/player";
import { docs } from "../contsants/documentation";
import { LoggerService } from "../logger/logger";
import { randomBytes } from "node:crypto";

export class Bot {
  client: discord.Client | null = null;
  voiceConnection: discordVoice.VoiceConnection | null = null;
  isIdling: boolean = false;
  player: Player;
  rest: discord.REST | null = null;
  commands: discord.RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
  logger: LoggerService;

  constructor() {
    const start = performance.now();

    this.logger = new LoggerService("Bot", 3);

    this.logger.log("bot init");

    this.player = new Player();

    if (!process.env.TOKEN) {
      this.logger.error("token was not found in .env");
      return;
    }

    this.client = new discord.Client({
      intents: [
        discord.GatewayIntentBits.DirectMessages,
        discord.GatewayIntentBits.Guilds,
        discord.GatewayIntentBits.GuildMessages,
        discord.GatewayIntentBits.MessageContent,
        discord.GatewayIntentBits.GuildMessageReactions,
        discord.GatewayIntentBits.GuildEmojisAndStickers,
        discord.GatewayIntentBits.GuildVoiceStates,
        discord.GatewayIntentBits.GuildInvites,
      ],
      partials: [
        Partials.Message,
        Partials.Reaction,
        Partials.GuildMember,
        Partials.Channel,
      ],
    });

    this.client.user?.setPresence({
      activities: [
        {
          name: "run /rofls for fun",
          type: discord.ActivityType.Watching,
          state: "cheto rabotait",
        },
      ],
    });

    this.client.user?.setUsername(
      `str ("Raji" "Bot") ${randomBytes(2).toString("hex")}`,
    );

    this.rest = new discord.REST({
      version: "9",
    }).setToken(process.env.TOKEN);

    this.client.on("messageCreate", async (message) => {
      this.logger.log(
        `message create from ${message.author.bot ? "bot" : ""} ${
          message.author.displayName
        } content ${message.content.trim()}`,
      );

      if (message.author.bot || !message.member) {
        return;
      }

      if (message.content === "!docs") {
        if (!(message.channel instanceof discord.TextChannel)) {
          return;
        }

        this.sendDocs(message.channel);
        return;
      }

      if (Math.random() > 0.9) {
        await message.react("🍇");
      }
    });

    this.client.on(discord.Events.InteractionCreate, async (interaction) => {
      this.logger.log(`interaction create`);

      if (interaction.isModalSubmit()) {
        this.logger.log(`interaction modal (${interaction.customId})`);

        if (!(interaction.customId === "igorstrimit?")) {
          return;
        }

        interaction.guild?.voiceStates.cache.map((voiceState) => {
          voiceState.setChannel("1139639067559084205");
        });

        await interaction.reply({
          content: "true",
          ephemeral: true,
        });
      }

      if (!interaction.isChatInputCommand()) {
        return;
      }

      this.logger.log(
        `interaction chat input command (${interaction.commandName})`,
      );

      if (interaction.commandName === "pokezhmodal") {
        const modal = new discord.ModalBuilder()
          .setCustomId("igorstrimit?")
          .setTitle("Question?!!!?!?!!?");

        const textInput = new discord.TextInputBuilder()
          .setCustomId("igorsmotritstrim")
          .setRequired(true)
          .setLabel("игорь смотрит стрим?")
          .setStyle(discord.TextInputStyle.Paragraph);

        const action =
          new discord.ActionRowBuilder<discord.TextInputBuilder>().setComponents(
            textInput,
          );

        modal.setComponents(action);

        await interaction.showModal(modal);
      }

      if (interaction.commandName === "rofls") {
        if (!interaction.guild) {
          return;
        }

        const commands = [
          async () => {
            if (
              !this.client ||
              !interaction.guildId ||
              !interaction.channelId
            ) {
              return;
            }

            const guild = await this.client.guilds.fetch(interaction.guildId);

            if (!guild) {
              this.logger.warn("no guild");
            }

            const channel = await guild.channels.fetch(interaction.channelId);

            if (!channel) {
              this.logger.warn("no channel");
              return;
            }

            channel.setName(randomBytes(5).toString("base64"));
          },
          async () => {
            if (
              !this.client ||
              !interaction.guildId ||
              !interaction.channelId
            ) {
              return;
            }

            const guild = await this.client.guilds.fetch(interaction.guildId);

            if (!guild) {
              this.logger.warn("no guild");
            }

            const channel = await guild.channels.fetch(interaction.channelId);

            if (!channel || !channel.isVoiceBased()) {
              this.logger.warn("no channel");
              return;
            }

            channel.clone({
              name: `${channel.name} clone`,
            });
          },
          async () => {
            if (
              !this.client ||
              !interaction.guildId ||
              !interaction.channelId
            ) {
              return;
            }

            const guild = await this.client.guilds.fetch(interaction.guildId);

            if (!guild) {
              this.logger.warn("no guild");
            }

            const channel = await guild.channels.fetch(interaction.channelId);

            if (!channel || !channel.isVoiceBased()) {
              this.logger.warn("no channel");
              return;
            }

            channel.setNSFW(Math.random() > 0.5);
          },
          async () => {
            if (
              !this.client ||
              !interaction.guildId ||
              !interaction.channelId
            ) {
              return;
            }

            interaction.guild?.voiceStates.cache.forEach((voice) => {
              voice.setDeaf();
            });
          },
          async () => {
            if (
              !this.client ||
              !interaction.guildId ||
              !interaction.channelId
            ) {
              return;
            }

            interaction.guild?.voiceStates.cache.forEach((voice) => {
              voice.setMute();
            });
          },
          async () => {
            if (
              !this.client ||
              !interaction.guildId ||
              !interaction.channelId
            ) {
              return;
            }

            interaction.guild?.voiceStates.cache.forEach((voice) => {
              voice.disconnect();
            });
          },
          async () => {
            if (
              !this.client ||
              !interaction.guildId ||
              !interaction.channelId
            ) {
              return;
            }

            const voiceStatesLength = interaction.guild?.voiceStates.cache.size;

            if (!voiceStatesLength) {
              this.logger.warn("no voice states length");
              return;
            }

            this.logger.log(`voice states length ${voiceStatesLength}`);

            interaction.guild?.voiceStates.cache
              .at((Math.random() * voiceStatesLength) | 0)
              ?.disconnect();
          },
          async () => {
            if (
              !this.client ||
              !interaction.guildId ||
              !interaction.channelId
            ) {
              return;
            }

            const voiceStatesLength = interaction.guild?.voiceStates.cache.size;

            if (!voiceStatesLength) {
              this.logger.warn("no voice states length");
              return;
            }

            this.logger.log(`voice states length ${voiceStatesLength}`);

            interaction.guild?.voiceStates.cache
              .at((Math.random() * voiceStatesLength) | 0)
              ?.setMute();
          },
        ];

        const roflIndex = (Math.random() * commands.length) | 0;

        try {
          this.logger.log(`rofls command call (${roflIndex})`);

          await commands[roflIndex]();

          interaction.reply({
            content: "sneaky rofl was executed",
            ephemeral: true,
          });
        } catch (e) {
          this.logger.error(
            `something went wrong when executing rofls command (${roflIndex}) ${e}`,
          );
        }
      }

      if (interaction.commandName === "sendhitoraji") {
        if (!this.client) {
          return;
        }

        const guild = await this.client.guilds.fetch(legendaryServerId);

        if (!guild) {
          return;
        }

        const channel = await guild.channels.fetch(legendaryChannelId);

        if (!channel || !channel.isTextBased()) {
          return;
        }

        const message = await channel.messages.fetch(legendaryRajiSlideId);

        if (!message) {
          return;
        }
        const stickers = await this.client.fetchPremiumStickerPacks();

        const stickerPack = stickers.get("847201503668207738");

        if (!stickerPack) {
          this.logger.warn("no sticker pack");
          return;
        }

        const sticker = stickerPack.stickers.get("781291131828699156");

        if (!sticker) {
          this.logger.warn("no sticker");
          return;
        }

        await message.reply({
          stickers: [sticker],
        });

        await message.reply({
          stickers: [sticker],
        });

        interaction.reply({
          content: "привет was send!",
          ephemeral: true,
        });
      }
    });

    this.client.login(process.env.TOKEN).then(async () => {
      this.commands.push();

      this.commands.push(
        new discord.SlashCommandBuilder()
          .setName("pokezhmodal")
          .setDescription("raji pred")
          .toJSON(),

        new discord.SlashCommandBuilder()
          .setName("rofls")
          .setDescription("raji")
          .toJSON(),

        new discord.SlashCommandBuilder()
          .setName("sendhitoraji")
          .setDescription("send hi to raji chtobi zaebat ego")
          .toJSON(),
      );

      await this.createCommands();

      this.logger.log(`bot login ${performance.now() - start}ms`);
    });
  }

  async createCommands() {
    this.logger.log("create commands try");

    if (!this.rest || !this.client?.user) {
      return;
    }

    try {
      await this.rest.put(
        discord.Routes.applicationCommands(this.client.user.id),
        {
          body: this.commands,
        },
      );

      this.logger.log(
        `custom slash commands (${this.commands.length}) registered.`,
      );
    } catch (e) {
      this.logger.error(
        `something went wrong when trying to create slash commands ${e}`,
      );
    }
  }

  greet(message: discord.Message<boolean>) {
    message.reply(animeGreetingGifUrl);
  }

  sendDocs(channel: discord.TextChannel) {
    docs.forEach((doc) => {
      const argsStr = doc.args.reduce((acc, curr) => {
        return acc + " " + curr;
      }, "");

      const embed = new discord.EmbedBuilder()
        .setTitle(doc.commandName)
        .setDescription(
          `${doc.desc}\n\n arguments count ${doc.args.length} ${argsStr}`,
        );

      channel.send({ embeds: [embed] });
    });
  }

  async destroy(): Promise<void> {
    await this.client?.destroy();
  }
}
