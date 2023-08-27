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
import { randomBytes, randomUUID } from "node:crypto";
import { Canvas } from "canvas";
import * as fs from "node:fs/promises";

export class Bot {
  client: discord.Client | null = null;
  voiceConnection: discordVoice.VoiceConnection | null = null;
  isIdling: boolean = false;
  player: Player;
  rest: discord.REST | null = null;
  commands: discord.RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
  logger: LoggerService;

  constructor() {
    this.logger = new LoggerService("Bot", 3);
    const start = performance.now();

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
      `str ("Raji" "Bot") ${randomBytes(2).toString("hex")}`
    );

    this.rest = new discord.REST({
      version: "9",
    }).setToken(process.env.TOKEN);

    this.client.on("messageCreate", async (message) => {
      this.logger.log(
        `message create from ${message.author.bot ? "bot" : ""} ${
          message.author.displayName
        } content ${message.content.trim()}`
      );

      if (message.author.bot) {
        return;
      }

      if (!message.member) {
        this.logger.warn("no message member");
        return;
      }

      if (message.content.startsWith("!play")) {
        this.logger.log("music play request");

        const { voice } = message.member;

        if (!voice.channelId) {
          message.reply("you must join voice blyat ");
          this.logger.warn(
            `cant play music, no one is in voice channel (${voice.channelId})`
          );
          return;
        }

        if (!message.guild || !message.guildId) {
          this.logger.warn("music play guild or guild id is null");
          return;
        }

        const videoUrl = message.content.split(" ")[1];

        if (!videoUrl) {
          this.logger.warn("music play no video url");
          const embed = new discord.EmbedBuilder()
            .setTitle("nety link na vidos")
            .setDescription("ya ne mogy igrat nichego")
            .setColor(`#${randomBytes(3).toString("hex")}`)
            .setImage(
              "https://tenor.com/view/%D0%BD%D0%B5%D0%BF%D0%BE%D0%BD%D1%8F%D0%BB-homelander-gif-26367246"
            );

          message.reply({
            embeds: [embed],
          });
          return;
        }

        this.player.pushNewVideoUrl(videoUrl);

        if (!(message.channel instanceof discord.TextChannel)) {
          return;
        }

        if (!this.player.queue.length) {
          this.player.play(message.channel);
        }

        if (this.player.voiceConnection) {
          return;
        }

        const connection = discordVoice.joinVoiceChannel({
          channelId: voice.channelId,
          guildId: message.guildId,
          adapterCreator: message.guild.voiceAdapterCreator,
        });

        this.player.voiceConnection = connection;

        this.player.play(message.channel);
      }

      if (message.content === "pls monke") {
        message.reply(
          Math.random() > 0.5
            ? "https://tenor.com/view/blacrswan-monkey-gif-20441402"
            : "https://tenor.com/view/monkey-run-small-monkey-gif-24640775"
        );
      }

      if (
        this.client &&
        this.client.application &&
        this.client.application.id &&
        message.mentions.has(this.client.application.id) &&
        message.content.includes("hi")
      ) {
        this.greet(message);
      }

      if (message.content === "!clear") {
        this.player.clear();
        return;
      }

      if (message.content === "!skip") {
        if (!(message.channel instanceof discord.TextChannel)) {
          return;
        }

        this.player.skip(message.channel);
        return;
      }

      if (message.content === "!pause") {
        this.player.pause();
      }

      if (message.content === "!unpause") {
        this.player.unpause();
      }

      if (message.content === "!docs") {
        if (!(message.channel instanceof discord.TextChannel)) {
          return;
        }

        this.sendDocs(message.channel);
        return;
      }

      if (message.author.id !== rajiId) {
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
        `interaction chat input command (${interaction.commandName})`
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
            textInput
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
            `something went wrong when executing rofls command (${roflIndex}) ${e}`
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
        console.log(stickerPack);

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

      if (interaction.commandName === "image") {
        const canvas = new Canvas(1500, 1500);

        const context = canvas.getContext("2d");

        const gradient = context.createLinearGradient(
          0,
          0,
          canvas.width,
          canvas.height
        );

        for (let i = 0; i < 4; i++) {
          gradient.addColorStop(i, `#${randomBytes(3).toString("hex")}`);
        }

        context.fillStyle = gradient;

        context.fillRect(0, 0, canvas.width, canvas.height);

        context.font = "90px Victor Mono NFM";

        for (let i = 0; i < 3; i++) {
          context.fillStyle = Math.random() > 0.5 ? "#fff" : "#000";

          context.fillText(
            `
  ^~^  ,
 ('Y') )
 /   \\/ 
(\\|||/) hjkl
`,
            // randomBytes(3).toString("hex"),
            Math.random() * canvas.width,
            Math.random() * canvas.height
          );
        }

        const date = new Date();

        const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

        const text = context.measureText(time);

        context.font = "17px Victor Mono NFM";

        context.fillStyle = "#ff0";

        const textOffsetX = 5;
        const textOffsetY = 5;

        console.log(canvas.width - text.width, canvas.width, text.width);

        context.fillText(
          time,
          canvas.width - text.width - textOffsetX,
          canvas.height - textOffsetY
        );

        const buffer = canvas.toBuffer("image/jpeg");

        const filePath = `/mnt/sda1/enokh/workspace/rajiBot/image/${randomUUID()}.jpg`;

        await fs.writeFile(filePath, buffer);

        this.logger.log(`writed file ${filePath}`);

        await interaction.reply({
          ephemeral: false,
          files: [filePath],
        });

        await fs.rm(filePath, { force: true });

        this.logger.log(`deleted file ${filePath}`);
      }

      // TODO: implement this

      // if (interaction.commandName === "whosdaynich") {
      //   console.log("daynich");
      //
      //   if (!interaction.guild) {
      //     return;
      //   }
      //
      //   // interaction.guild.client.
      //
      //   interaction.reply();
      // }
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

        new discord.SlashCommandBuilder()
          .setName("whosdaynich")
          .setDescription("get todays daynich")
          .toJSON(),

        new discord.SlashCommandBuilder()
          .setName("image")
          .setDescription("image")
          .toJSON()
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
        }
      );

      this.logger.log(
        `custom slash commands (${this.commands.length}) registered.`
      );
    } catch (e) {
      this.logger.error(
        `something went wrong when trying to create slash commands ${e}`
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
          `${doc.desc}\n\n arguments count ${doc.args.length} ${argsStr}`
        );

      channel.send({ embeds: [embed] });
    });
  }

  async destroy(): Promise<void> {
    await this.client?.destroy();
  }
}
