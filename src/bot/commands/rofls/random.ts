import { Maybe } from 'src/monads/maybe/types/maybe'
import { CacheType, ChatInputCommandInteraction, Guild } from 'discord.js'
import { getGuildMembers } from 'src/utils/getGuildMembers'
import { getRandomMember } from 'src/utils/getRandomMember'
import { randomBytes } from 'node:crypto'
import { maybe } from 'src/monads/maybe/maybe'
import { getRandomVoiceState } from 'src/utils/getRandomVoiceState'
import { MusicPlayer } from 'src/bot/music-player/music-player'

export type Random = (
  guild: Maybe<Guild>,
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

    const nickname = getRandomMember(members)
      .map((member) => member.nickname)
      .fmap(maybe)

    nickname.merge(guild).map((merged) => {
      merged[1].edit({
        name: merged[0],
      })
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

    const channelId = member.fmap((member) => maybe(member.voice.channelId))

    const player = new MusicPlayer()

    player.silentPlay(
      guild,
      channelId,
      'https://www.youtube.com/watch?v=lr4vi_XAjQQ',
    )

    player.onEnd = maybe(() => {
      player.destroy()
    })
  },
]
