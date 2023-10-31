import voice, {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} from '@discordjs/voice'
import { maybe } from 'src/monads/maybe/maybe'
import * as pdl from 'play-dl'
import { EmbedBuilder, Message } from 'discord.js'
import { LoggerService } from 'src/logger/logger'
import { GuildMember } from 'discord.js'
import { Maybe } from 'src/monads/maybe/types/maybe'

export class MusicPlayer {
  private voiceState = maybe<voice.VoiceConnection>(null)
  private audioPlayer = maybe<voice.AudioPlayer>(null)
  private subscription = maybe<voice.PlayerSubscription>(null)
  private logger = new LoggerService('Music Player')

  public commands = new Map<string, (message: Message<boolean>) => void>([
    ['play', (message) => this.play(message, message.content.split(' ')[1])],
    ['pause', () => this.pause()],
    ['unpause', () => this.unpause()],
  ])

  constructor() {
    this.logger.log('init')
  }

  private pause() {
    this.audioPlayer.map((player) => player.stop())
  }

  private unpause() {
    this.audioPlayer.map((player) => player.unpause())
  }

  private createVoiceState(member: Maybe<GuildMember>, voiceId: Maybe<string>) {
    return member.merge(voiceId).map((merged) => {
      return joinVoiceChannel({
        guildId: merged[0].guild.id,
        channelId: merged[1],
        adapterCreator: merged[0].guild.voiceAdapterCreator,
      })
    })
  }

  private createAudioPlayer(voiceState: Maybe<voice.VoiceConnection>) {
    return voiceState.map((state) => {
      const player = createAudioPlayer()

      this.subscription = maybe(state.subscribe(player) ?? null)

      return player
    })
  }

  private async createAudioResource(url: string) {
    const video = await pdl.stream(url, {
      discordPlayerCompatibility: true,
    })

    return createAudioResource(video.stream)
  }

  private play(message: Message<boolean>, url: string) {
    this.logger.log(`play try ${url}`)

    const member = maybe(message.member)

    const voiceId = member.map((m) => m.voice.channelId).fmap(maybe)

    this.voiceState = this.createVoiceState(member, voiceId)

    this.audioPlayer = this.createAudioPlayer(this.voiceState)

    this.audioPlayer.asyncMap(async (player) => {
      try {
        const resource = await this.createAudioResource(url)

        player.play(resource)

        message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('DA YA IGRAYU HERNYU TVOYU')
              .setColor('Blurple')
              .setDescription('playing your shitty music')
              .setImage(
                'http://trespedros.com/wp-content/uploads/2018/08/Black-Iron-Steel-Pipes.jpg',
              ),
          ],
        })

        this.logger.log(`playing ${url}`)
      } catch (e) {
        console.log(e)
      }
    })
  }

  public destroy() {
    this.voiceState.merge(this.audioPlayer).map((merged) => {
      merged[0].destroy()
      merged[1].stop()
    })
    this.subscription.map((s) => s.unsubscribe())
  }
}
