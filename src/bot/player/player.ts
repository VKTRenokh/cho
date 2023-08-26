import { LoggerService } from "../../logger/logger";
import { Queue } from "../../common/queue/queue";
import * as discordVoice from "@discordjs/voice";
import * as discord from "discord.js";
import * as ytdl from "play-dl";

export class Player {
  queue: Queue<string>;
  voiceConnection: discordVoice.VoiceConnection | null = null;
  audioPlayer: discordVoice.AudioPlayer | null = null;
  audioPlayerSubscription: discordVoice.PlayerSubscription | null = null;
  private logger: LoggerService;

  constructor() {
    this.logger = new LoggerService("Music Player", 3);
    this.queue = new Queue();

    this.logger.log("player init");
  }

  pushNewVideoUrl(videoUrl: string) {
    this.queue.enqueue(videoUrl);
  }

  async play(channel: discord.TextChannel) {
    if (!this.voiceConnection) {
      return;
    }

    this.audioPlayer = discordVoice.createAudioPlayer();

    const subscription = this.voiceConnection.subscribe(this.audioPlayer);

    if (!subscription) {
      return;
    }

    this.audioPlayerSubscription = subscription;

    const next = this.queue.dequeue();

    if (!next) {
      const embed = new discord.EmbedBuilder()
        .setColor("#9ece60")
        .setTitle("music.length is 0")
        .setThumbnail(
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMrmGYqwRxx-1AS-ZSVOl29ZNOaARkvAJFVZIgttPs&s"
        )
        .setDescription("There is no more videos...");

      channel.send({ embeds: [embed] });
      return;
    }

    const video = await ytdl.stream(next);

    const source = discordVoice.createAudioResource(video.stream, {
      inputType: video.type,
    });

    this.audioPlayer.play(source);

    this.audioPlayer.on(discordVoice.AudioPlayerStatus.Idle, () => {
      this.audioPlayerSubscription?.unsubscribe();
      this.audioPlayer?.stop();
      this.audioPlayer = null;
      this.audioPlayerSubscription = null;

      this.play(channel);
    });

    const { video_details } = await ytdl.video_info(next);

    if (!video_details.title) {
      return;
    }

    const embed = new discord.EmbedBuilder()
      .setColor("#914c50")
      .setTitle(`Next Video Is Playing`)
      .setDescription(video_details.title)
      .setThumbnail(video_details.thumbnails[0].url);

    channel.send({ embeds: [embed] });
  }

  stop() {
    this.audioPlayerSubscription?.unsubscribe();

    this.audioPlayer = null;

    this.audioPlayerSubscription = null;
  }

  pause() {
    this.audioPlayer?.pause();
  }

  unpause() {
    this.audioPlayer?.unpause();
  }

  clear() {
    this.queue.clear();
    this.stop();
  }

  skip(channel: discord.TextChannel) {
    this.play(channel);
  }
}
