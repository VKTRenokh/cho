import {
  ChatInputCommandInteraction,
  CommandInteractionOption,
} from 'discord.js'
import { M } from '@victorenokh/maybe.ts'

const optionToString = (o: CommandInteractionOption) =>
  (o.value ?? 'string').toString()

export const getStringOption = (
  interaction: ChatInputCommandInteraction,
  key: string,
): M.Maybe<string> => {
  return M.of(interaction.options.get(key)).map(optionToString)
}

export class Options {
  constructor(private interaction: ChatInputCommandInteraction) {}

  public string(key: string) {
    return M.of(this.interaction.options.get(key)).map(optionToString)
  }

  public attachment(key: string) {
    return M.of(this.interaction.options.get(key)).mapNullable(
      (option) => option.attachment,
    )
  }
}
