import voice, {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} from '@discordjs/voice'
import { Maybe, maybe, mergeMap } from 'src/utils/maybe'
import * as pdl from 'play-dl'
import { Message } from 'discord.js'
import { LoggerService } from 'src/logger/logger'
import { Guild } from 'discord.js'
import { playing } from 'src/contsants/player-reply'
import { disconnectTimeout } from 'src/contsants/constants'
import { getLink } from './utils/get-link'

export class MusicPlayer {
  private voiceState = maybe<voice.VoiceConnection>(null)
  private audioPlayer = maybe<voice.AudioPlayer>(null)
  private subscription = maybe<voice.PlayerSubscription>(null)
  private logger = new LoggerService('Music Player')
  public onEnd = maybe<() => void>(null)
  private queue: string[] = []

  private commands = new Map<string, (message: Message<boolean>) => void>([
    ['play', (message) => this.play(message, getLink(message))],
    ['pause', () => this.pause()],
    ['unpause', () => this.unpause()],
    ['stop', () => this.stop()],
  ])

  constructor() {
    this.logger.log('init')
  }

  public getCommand(key: string) {
    return maybe(this.commands.get(key) ?? null)
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

  private createVoiceState(guild: Maybe<Guild>, voiceId: Maybe<string>) {
    return mergeMap(guild, voiceId, (guild, voiceId) =>
      joinVoiceChannel({
        guildId: guild.id,
        channelId: voiceId,
        adapterCreator: guild.voiceAdapterCreator,
      }),
    )
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

  private play(message: Message<boolean>, url: Maybe<string>): void {
    this.logger.log(`play try ${url.getOrElse('no url')}`)

    const member = maybe(message.member)

    const guild = member.map((m) => m.guild)

    const voiceId = member.map((m) => m.voice.channelId).fmap(maybe)

    this.voiceState = url.fmap(() => this.createVoiceState(guild, voiceId))

    this.audioPlayer = this.createAudioPlayer(this.voiceState)

    this.audioPlayer.merge(url).asyncMap(async (merged) => {
      try {
        const resource = await this.createAudioResource(merged.right)

        merged.left.play(resource)

        message?.reply({
          embeds: [playing],
        })

        this.logger.log(`playing ${merged.right}`)

        merged.left.on('stateChange', (state) => {
          if (state.status !== AudioPlayerStatus.Idle) {
            return
          }

          this.disconectOnIdle(disconnectTimeout)
        })
      } catch (e) {
        this.logger.error(`error occured while trying to play ${e}`)
      }
    })
  }

  private disconectOnIdle(timeout: number) {
    setTimeout(() => {
      this.stop()
      this.subscription.map((s) => s.unsubscribe())
    }, timeout)
  }

  public silentPlay(
    guild: Maybe<Guild>,
    voiceId: Maybe<string>,
    url: string,
  ): void {
    this.voiceState = this.createVoiceState(guild, voiceId)

    this.audioPlayer = this.createAudioPlayer(this.voiceState)

    this.audioPlayer.asyncMap(async (player) => {
      const resource = await this.createAudioResource(url)

      player.play(resource)

      player.on('stateChange', (_, state) => {
        if (state.status === AudioPlayerStatus.Idle) {
          this.onEnd.map((fn) => fn())
        }
      })

      this.logger.log(`silent playing ${url}`)
    })
  }

  public destroy() {
    this.voiceState.merge(this.audioPlayer).map((merged) => {
      merged.left.destroy()
      merged.right.stop()
    })
    this.subscription.map((s) => s.unsubscribe())
  }
}
