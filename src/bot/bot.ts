import * as discord from "discord.js";
import * as discordVoice from "@discordjs/voice";
import { Partials } from "discord.js";
import { rajiId, animeGreetingGifUrl } from "../contsants/constants";
import { Player } from "./player/player";
import { docs } from "../contsants/documentation";

export class Bot {
  client: discord.Client | null = null;
  voiceConnection: discordVoice.VoiceConnection | null = null;
  isIdling: boolean = false;
  player: Player;
  rest: discord.REST | null = null
  commands: discord.RESTPostAPIChatInputApplicationCommandsJSONBody[] = []

  constructor() {
    this.player = new Player();

    if (!process.env.TOKEN) {
      console.log("return");
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

    this.rest = new discord.REST({
      version: '9',
    }).setToken(process.env.TOKEN)


    this.client.on("messageCreate", async (message) => {
      console.log(message.content);

      if (message.author.bot) {
        return;
      }

      if (!message.member) {
        console.log("no message member");
        return;
      }

      if (message.content.startsWith("!play")) {
        const { voice } = message.member;

        if (!voice.channelId) {
          message.reply("you must join voice blyat ");
          return;
        }

        if (!message.guild || !message.guildId) {
          return;
        }

        const videoUrl = message.content.split(" ")[1];

        if (!videoUrl) {
          return;
        }

        this.player.pushNewVideoUrl(videoUrl);

        if (!(message.channel instanceof discord.TextChannel)) {
          return;
        }

        console.log(this.player.queue.length);

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
      console.log('interaction create')

      if (interaction.isModalSubmit()) {
        if (!(interaction.customId === 'igorstrimit?')) {
          return
        }

        interaction.guild?.voiceStates.cache.map((voiceState) => {
          voiceState.setChannel('1139639067559084205')
        })

        await interaction.reply({
          content: 'true',
          ephemeral: true,
        })
      }

      if (!interaction.isChatInputCommand()) {
        return
      }

      if (interaction.commandName === 'pokezhmodal') {
        const modal = new discord.ModalBuilder().setCustomId('igorstrimit?').setTitle('Question?!!!?!?!!?')

        const textInput = new discord.TextInputBuilder()
          .setCustomId('igorsmotritstrim')
          .setRequired(true)
          .setLabel('игорь смотрит стрим?')
          .setStyle(discord.TextInputStyle.Paragraph)

        const action = new discord.ActionRowBuilder<discord.TextInputBuilder>().setComponents(textInput)

        modal.setComponents(action)

        await interaction.showModal(modal)
      }
    })

    this.client.login(process.env.TOKEN).then(() => {
      this.commands.push(new discord.SlashCommandBuilder().setName('pokezhmodal').setDescription('raji pred').toJSON())

      void this.createCommands()
    })
  }

  private async createCommands() {
    console.log('create commands call')

    if (!this.rest || !this.client?.user) {
      console.log('return')
      return
    }


    try {
      await this.rest.put(
        discord.Routes.applicationCommands(this.client.user.id),
        {
          body: this.commands
        }
      )

      console.log(`custom slash commands (${this.commands.length}) registered.`)
    } catch (e) {
      console.log(`something went wrong when trying to create slash commands`, e)
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
}
