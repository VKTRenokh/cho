import { Guild } from 'discord.js'
import { Maybe } from '@victorenokh/maybe.ts'

export const getRandomVoiceState = (guild: Maybe<Guild>) => {
  return guild.mapNullable((guild) =>
    guild.voiceStates.cache.at(guild.voiceStates.cache.size),
  )
}
