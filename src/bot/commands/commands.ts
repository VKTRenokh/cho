import { SlashCommandBuilder } from 'discord.js'
import { Command } from './command.ts'
import { maybe } from 'src/monads/maybe/maybe.ts'
import { getMessage } from 'src/utils/getMessage.ts'
import {
  chocoHelloStickerId,
  chocoStickerPackId,
  legendaryChannelId,
  legendaryRajiSlideId,
} from 'src/contsants/constants.ts'
import { LoggerService } from 'src/logger/logger.ts'
import { getGuildMembers } from 'src/utils/getGuildMembers.ts'

export class Commands {
  private logger = new LoggerService('Commands')

  constructor() {
    this.logger.log('init')
  }
}

const logger = new LoggerService('Commands')
export const commands = new Map<string, Command>()

commands.set(
  'rofls',
  new Command(
    new SlashCommandBuilder().setDescription('rofls').setName('rofls').toJSON(),
    (interaction) => {
      interaction.reply({
        ephemeral: true,
        content: 'no rofls :(',
        tts: true,
      })
    },
  ),
)

commands.set(
  'sendhi',
  new Command(
    new SlashCommandBuilder()
      .setDescription('send hi')
      .setName('sendhi')
      .toJSON(),
    async (interaction, client) => {
      try {
        const message = await getMessage(
          maybe(interaction.guild),
          legendaryChannelId,
          legendaryRajiSlideId,
        )

        const stickers = await client.fetchPremiumStickerPacks()

        const stickerPack = maybe(stickers.get(chocoStickerPackId) ?? null)

        const sticker = stickerPack
          .map((pack) => pack.stickers.get(chocoHelloStickerId) ?? null)
          .fmap(maybe)

        await sticker
          .merge(message)
          .asyncMap(([sticker, message]) =>
            message.reply({ stickers: [sticker] }),
          )

        interaction.reply({ ephemeral: true, content: 'hi was send' })
      } catch (e) {
        logger.error(`error occured with sendhi: ${e}`)
      }
    },
  ),
)

commands.set(
  'votebogdanwake',
  new Command(
    new SlashCommandBuilder()
      .setName('votebogdanwake')
      .setDescription('vote when bogdan gonna wake')
      .toJSON(),
    (inter) => {},
  ),
)

commands.set(
  'setnicknameall',
  new Command(
    new SlashCommandBuilder()
      .setName('setnicknameall')
      .setDescription('set nickname for all people on this server')
      .addStringOption((option) =>
        option.setName('nickname').setDescription('nickname to set'),
      )
      .toJSON(),
    async (interaction) => {
      const option = maybe(interaction.options.get('nickname'))

      const value = option
        .map((option) => option.value ?? null)
        .fmap(maybe)
        .map((value) => value.toString())

      const members = await getGuildMembers(maybe(interaction.guild))

      members.merge(value).map((merged) => {
        merged[0].forEach((member) => member.edit({ nick: merged[1] }))

        interaction.reply({ content: 'changed nicknames', ephemeral: true })
      })
    },
  ),
)

logger.log('init')
