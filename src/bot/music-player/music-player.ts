import { E, M } from '@victorenokh/maybe.ts'
import * as pdl from 'play-dl'
import {
  AudioPlayer,
  AudioPlayerState,
  AudioPlayerStatus,
  AudioResource,
  PlayerSubscription,
  VoiceConnection,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} from '@discordjs/voice'
import { Guild, GuildMember, Message } from 'discord.js'
import { LoggerService } from 'src/logger/logger'
import { getLink } from './utils/get-link'
import { Queue } from './utils/queue'

export type Command = (message: Message<boolean>) => void

interface Player {
  player: AudioPlayer
  subscription: M.Maybe<PlayerSubscription>
}

interface Playable {
  resource: Promise<AudioResource<null>>
  player: Player
  url: string
}

export class MusicPlayer {
  private logger = new LoggerService('Music Player')
  public onEnd = M.none<() => void>()
  private queue = new Queue<string>()
  public status: AudioPlayerStatus = AudioPlayerStatus.Idle

  private commands = new Map<string, Command>([
    ['play', (message) => this.play(message)],
    // ['pause', () => this.pause()],
    // ['unpause', () => this.unpause()],
    ['nigger', () => undefined],
    ['stop', () => this.stop()],
  ])

  constructor() {
    this.logger.log('init')
  }

  public getCommandsString() {
    return Array.from(this.commands.keys())
      .filter(Boolean)
      .reduce((acc, curr) => acc + ', ' + curr, '')
  }

  public getCommand(key: string): M.Maybe<Command> {
    return M.fromUndefined(this.commands.get(key))
  }

  private stop() {
    this.queue = new Queue()
  }

  private getVoiceChannelId(
    member: M.Maybe<GuildMember>,
  ): E.Either<string, string> {
    const voiceId = member.mapNullable((m) => m.voice.channelId)

    return E.fromMaybe(voiceId, 'you should join voice channel firstly')
  }

  private parseUrl(message: Message<boolean>): E.Either<string, string> {
    return E.fromMaybe(getLink(message), 'no link was provided')
  }

  private createVoiceState(guild: M.Maybe<Guild>, channelId: string) {
    return E.fromMaybe<string, VoiceConnection>(
      guild.map((guild) =>
        joinVoiceChannel({
          channelId,
          adapterCreator: guild.voiceAdapterCreator,
          guildId: guild.id,
        }),
      ),
      'no guild',
    )
  }

  private createAudioPlayer(state: VoiceConnection) {
    const player = createAudioPlayer()

    return { player, subscription: M.fromUndefined(state.subscribe(player)) }
  }

  private async createAudioResource(url: string) {
    const video = await pdl.stream(url, { discordPlayerCompatibility: true })

    return createAudioResource(video.stream)
  }

  private async test(playable: Playable, message: Message<boolean>) {
    const resource = await playable.resource
    const player = playable.player.player

    player.play(resource)
    this.status = AudioPlayerStatus.Playing

    const listener = (_: AudioPlayerState, state: AudioPlayerState) => {
      this.status = state.status

      if (state.status !== AudioPlayerStatus.Idle) {
        return
      }

      M.of(this.queue.dequeue()).map((link) => this.play(message, link))

      player.removeListener('stateChange', listener)
    }

    player.on('stateChange', listener)

    console.log(this.status)
  }

  private onPlaying(message: Message<boolean>) {
    getLink(message).map((link) => this.queue.enqueue(link))

    console.log(this.queue)
  }

  private play(message: Message<boolean>, link?: string) {
    console.log(this.status)
    if (
      this.status === AudioPlayerStatus.Playing ||
      (this.status === AudioPlayerStatus.Buffering && !link)
    ) {
      this.onPlaying(message)
      return
    }

    const member = M.of(message.member)
    const guild = member.map((member) => member.guild)

    const voiceChannelId = this.getVoiceChannelId(member)

    const url = voiceChannelId.flatMap((id) =>
      !link
        ? this.parseUrl(message).map((url) => ({ id, url }))
        : E.right({ url: link, id }),
    )

    const player = url
      .flatMap((v) =>
        this.createVoiceState(guild, v.id).map((connection) => ({
          state: connection,
          url: v.url,
        })),
      )
      .map((v) => ({ url: v.url, player: this.createAudioPlayer(v.state) }))

    const withResource = player.map((v) => ({
      ...v,
      resource: this.createAudioResource(v.url),
    }))

    withResource.fold(
      (e) => (message.reply(e), undefined),
      (v) => this.test(v, message),
    )
  }
}

// const player = url
//   .flatMap((v) => ({
//     state: this.createVoiceState(guild, v.id),
//     url: v.url,
//   }))
//   .map((v) => this.createAudioPlayer(v))

// const url = player.flatMap((player) =>
//   !link
//     ? this.parseUrl(message).map((url) => ({ player, url }))
//     : E.right({ url: link, player }),
// )
