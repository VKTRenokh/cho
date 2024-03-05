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
import { EmbedBuilder, Guild, GuildMember, Message } from 'discord.js'
import { LoggerService } from 'src/logger/logger'
import { getLink } from './utils/get-link'
import { Queue } from './utils/queue'
import { replyWithEmbed } from 'src/utils/reply-with-embed'

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
  private queue = new Queue<string>()
  private player = M.none<AudioPlayer>()
  private currentLink = M.of<string>(
    'https://www.youtube.com/watch?v=u4ZtCuxMls0',
  )

  public onEnd = M.none<() => void>()
  public status: AudioPlayerStatus = AudioPlayerStatus.Idle

  private commands = new Map<string, Command>([
    ['play', (message) => this.play(message)],
    ['pause', () => this.pause()],
    ['unpause', () => this.unpause()],
    ['skip', (message) => this.skip(message)],
    ['stop', () => this.stop()],
    ['queue', (message) => this.showQueue(message)],
    ['np', (message) => this.showTrackInfo(message)],
  ])

  constructor() {
    this.logger.log('init')
  }

  private videoInfoToEmbed(info: pdl.InfoData) {
    const hex = Buffer.from(info.video_details.title ?? '')
      .toString('hex')
      .slice(0, 6)
    const tags = info.video_details.tags.join(', ')

    return new EmbedBuilder()
      .setTitle(info.video_details.title ?? null)
      .addFields([
        { name: 'duration', value: info.video_details.durationRaw },
        { name: 'tags', value: tags || 'no tags' },
      ])
      .setImage(info.video_details.thumbnails[0].url)
      .setDescription(info.video_details.description ?? null)
      .setColor(`#${hex}`)
  }

  private async showTrackInfo(message: Message<boolean>) {
    const videoInfo = await this.currentLink.asyncMap((link) => {
      return pdl.video_info(link)
    })

    const embed = videoInfo.map(this.videoInfoToEmbed.bind(this))

    embed.map(replyWithEmbed(message))
  }

  private showQueue(message: Message<boolean>) {
    const links = this.queue.toArray()

    const linksString = links.reduce(
      (acc, curr, index) => `${acc}\n${curr} - ${index + 1}`,
      '',
    )

    message.reply({
      content: `total: ${links.length}\n ${linksString}`,
    })
  }

  private unpause() {
    this.player.map((player) => player.unpause())
  }

  private pause() {
    this.player.map((player) => player.pause())
  }

  private next(): E.Either<string, string> {
    const link = this.queue.dequeue()

    return link ? E.right(link) : E.left('there is no tracks in queue')
  }

  private skip(message: Message<boolean>) {
    this.next().fold<unknown>(
      (error) => message.reply({ content: error }),
      (link) => {
        message.reply({ content: 'skiping...' })
        this.play(message, link)
      },
    )
  }

  public getCommandsString() {
    return Array.from(this.commands.keys())
      .filter(Boolean)
      .reduce((acc, curr) => `${acc}\n${curr}`, '')
  }

  public getCommand(key: string): M.Maybe<Command> {
    return M.fromUndefined(this.commands.get(key))
  }

  private stop() {
    this.queue = new Queue()

    this.player = this.player.mapNullable<AudioPlayer>(
      (player) => (player.stop(), null),
    )
  }

  private getVoiceChannelId(
    member: M.Maybe<GuildMember>,
  ): E.Either<string, string> {
    const voiceId = member.mapNullable((m) => m.voice.channelId)

    return E.fromMaybe(voiceId, 'you should join voice channel firstly')
  }

  private createUrlParser(message: Message, link?: string) {
    return (id: string): E.Either<string, { id: string; url: string }> =>
      !link
        ? getLink(message).map((url) => ({ id, url }))
        : E.right({ url: link, id })
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

  private async startPlaying(playable: Playable, message: Message<boolean>) {
    const resource = await playable.resource
    const player = playable.player.player

    this.player = M.of(player)

    player.play(resource)

    message.reply('playing...')

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
  }

  private onPlaying(message: Message<boolean>) {
    getLink(message).map((link) => this.queue.enqueue(link))
  }

  private play(message: Message<boolean>, link?: string) {
    if (this.status === AudioPlayerStatus.Playing && !link) {
      this.onPlaying(message)
      return
    }

    const member = M.of(message.member)
    const guild = member.map((member) => member.guild)

    const voiceChannelId = this.getVoiceChannelId(member)

    const url = voiceChannelId.flatMap(this.createUrlParser(message, link))

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
      (v) => {
        this.currentLink = M.of(v.url)
        this.startPlaying(v, message)
      },
    )
  }
}
