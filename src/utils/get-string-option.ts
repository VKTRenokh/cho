import { ChatInputCommandInteraction } from 'discord.js'
import { Maybe, maybe } from '@victorenokh/maybe.ts'

export const getStringOption = (
  interaction: ChatInputCommandInteraction,
  key: string,
): Maybe<string> => {
  return maybe(interaction.options.get(key)).map((option) =>
    (option.value ?? '').toString(),
  )
}

export class Options {
  constructor(private interaction: ChatInputCommandInteraction) {}

  public string(key: string) {
    return maybe(this.interaction.options.get(key)).map((option) =>
      (option.value ?? '').toString(),
    )
  }

  public attachment(key: string) {
    return maybe(this.interaction.options.get(key)).mapNullable(
      (option) => option.attachment,
    )
  }
}
