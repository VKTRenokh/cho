import { Guild } from 'discord.js'
import { M } from '@victorenokh/maybe.ts'

export const getRandomVoiceState = (guild: M.Maybe<Guild>) => {
  return guild.mapNullable((guild) =>
    guild.voiceStates.cache.at(guild.voiceStates.cache.size),
  )
}
