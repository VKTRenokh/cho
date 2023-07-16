import * as discord from "discord.js";
import * as discordVoice from "@discordjs/voice";
import { Partials } from "discord.js";
import * as ytdl from "play-dl";
import { rajiId, animeGreetingGifUrl } from "../contsants/constants";
import { Player } from "./player/player";

export class Bot {
  client: discord.Client | null = null;
  voiceConnection: discordVoice.VoiceConnection | null = null;
  isIdling: boolean = false;
  player: Player;

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
          console.log("asdfsdaf");
          return;
        }

        const videoUrl = message.content.split(" ")[1];

        if (!videoUrl) {
          return;
        }

        this.player.pushNewVideoUrl(videoUrl);
        console.log(this.player.queue.items);

        if (this.player.voiceConnection) {
          return;
        }

        const connection = discordVoice.joinVoiceChannel({
          channelId: voice.channelId,
          guildId: message.guildId,
          adapterCreator: message.guild.voiceAdapterCreator,
        });

        this.player.voiceConnection = connection;

        if (!(message.channel instanceof discord.TextChannel)) {
          return;
        }

        this.player.play(message.channel);
      }

      if (message.content === "pls monke") {
        message.reply(
          Math.random() > 0.5
            ? "https://tenor.com/view/blacrswan-monkey-gif-20441402"
            : "https://tenor.com/view/monkey-run-small-monkey-gif-24640775",
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

      if (message.author.id !== rajiId) {
        return;
      }

      if (Math.random() > 0.9) {
        await message.react("🍇");
      }
    });

    this.client.login(process.env.TOKEN);
  }

  greet(message: discord.Message<boolean>) {
    message.reply(animeGreetingGifUrl);
  }
}
