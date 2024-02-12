import { Guild } from 'discord.js'
import { Maybe, maybe } from './maybe'

export const getRandomVoiceState = (guild: Maybe<Guild>) => {
  return guild.flatMap((guild) =>
    maybe(guild.voiceStates.cache.at(guild.voiceStates.cache.size) ?? null),
  )
}
