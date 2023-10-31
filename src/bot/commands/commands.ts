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

        throw new Error('dfafsdf')
      } catch (e) {
        logger.error(`error occured with sendhi: ${e}`)
      }
    },
  ),
)

logger.log('init')
