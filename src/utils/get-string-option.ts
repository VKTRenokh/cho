import { ChatInputCommandInteraction } from 'discord.js'
import { Maybe, maybe } from './maybe'

export const getStringOption = (
  interaction: ChatInputCommandInteraction,
  key: string,
): Maybe<string> => {
  return maybe(interaction.options.get(key)).map((option) =>
    (option.value ?? '').toString(),
  )
}

export const createGetStringOption = (
  interaction: ChatInputCommandInteraction,
): ((key: string) => Maybe<string>) => {
  return (key) => getStringOption(interaction, key)
}
