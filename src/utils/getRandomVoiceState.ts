import { Maybe } from 'src/monads/maybe/types/maybe'
import { Guild } from 'discord.js'
import { maybe } from 'src/monads/maybe/maybe'

export const getRandomVoiceState = (guild: Maybe<Guild>) => {
  return guild.fmap((guild) =>
    maybe(guild.voiceStates.cache.at(guild.voiceStates.cache.size) ?? null),
  )
}
