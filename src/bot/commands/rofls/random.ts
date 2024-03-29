import { CacheType, ChatInputCommandInteraction, Guild } from 'discord.js'
import { getGuildMembers } from 'src/utils/getGuildMembers'
import { getRandomMember } from 'src/utils/getRandomMember'
import { randomBytes, randomInt } from 'node:crypto'
import { getRandomVoiceState } from 'src/utils/getRandomVoiceState'
import { MusicPlayer } from 'src/bot/music-player/music-player'
import { M } from '@victorenokh/maybe.ts'
import { musicUrls } from 'src/contsants/rofls'

export type Random = (
  guild: M.Maybe<Guild>,
  interaction: ChatInputCommandInteraction<CacheType>,
) => Promise<void> | void

export const random: Random[] = [
  async (guild) => {
    const members = await getGuildMembers(guild)

    const member = getRandomMember(members)

    member.map((m) => m.edit({ nick: randomBytes(4).toString('hex') }))
  },
  async (guild) => {
    guild.asyncMap(async (guild) => {
      return await guild.edit({
        description: randomBytes(100).toString('hex'),
      })
    })
  },
  async (guild) => {
    const members = await getGuildMembers(guild)

    const nickname = getRandomMember(members).mapNullable(
      (member) => member.nickname,
    )

    M.mergeMap(nickname, guild, (nickname, guild) => {
      guild.edit({ name: nickname })
    })
  },
  async (guild) => {
    const voiceState = getRandomVoiceState(guild)

    voiceState.map((voice) => {
      voice.setMute()
    })
  },
  async (guild, interaction) => {
    const member = await guild.asyncMap(
      async (g) => await g.members.fetch({ user: interaction.user }),
    )

    const channelId = member.mapNullable((member) => member.voice.channelId)

    const player = new MusicPlayer()

    // player.silentPlay(guild, channelId, musicUrls[randomInt(musicUrls.length)])
    //
    // player.onEnd = M.of(() => {
    //   player.destroy()
    // })
  },
]
