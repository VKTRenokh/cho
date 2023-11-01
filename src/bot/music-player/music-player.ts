import voice, {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} from '@discordjs/voice'
import { maybe } from 'src/monads/maybe/maybe'
import * as pdl from 'play-dl'
import { Message } from 'discord.js'
import { LoggerService } from 'src/logger/logger'
import { GuildMember } from 'discord.js'
import { Maybe } from 'src/monads/maybe/types/maybe'
import { playing } from 'src/contsants/player-reply'

export class MusicPlayer {
  private voiceState = maybe<voice.VoiceConnection>(null)
  private audioPlayer = maybe<voice.AudioPlayer>(null)
  private subscription = maybe<voice.PlayerSubscription>(null)
  private logger = new LoggerService('Music Player')

  public commands = new Map<string, (message: Message<boolean>) => void>([
    [
      'play',
      (message) =>
        this.play(message, maybe(message.content.split(' ')[1] ?? null)),
    ],
    ['pause', () => this.pause()],
    ['unpause', () => this.unpause()],
    ['stop', () => this.stop()],
  ])

  constructor() {
    this.logger.log('init')
  }

  private stop() {
    this.audioPlayer.map((player) => player.stop())
  }

  private pause() {
    this.audioPlayer.map((player) => player.pause())
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

  private play(message: Message<boolean>, url: Maybe<string>) {
    this.logger.log(`play try ${url.getOrElse('no url')}`)

    const member = maybe(message.member)

    const voiceId = member.map((m) => m.voice.channelId).fmap(maybe)

    this.voiceState = url.fmap(() => this.createVoiceState(member, voiceId))

    this.audioPlayer = this.createAudioPlayer(this.voiceState)

    this.audioPlayer.merge(url).asyncMap(async (merged) => {
      try {
        const resource = await this.createAudioResource(merged[1])

        merged[0].play(resource)

        message.reply({
          embeds: [playing],
        })

        this.logger.log(`playing ${merged[1]}`)
      } catch (e) {
        this.logger.error(`error occured while trying to play ${e}`)
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
