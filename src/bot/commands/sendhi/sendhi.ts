import { CacheType, ChatInputCommandInteraction, Client } from 'discord.js'
import {
  chocoHelloStickerId,
  chocoStickerPackId,
  legendaryChannelId,
  legendaryRajiSlideId,
} from 'src/contsants/constants'
import { LoggerService } from 'src/logger/logger'
import { maybe } from 'src/monads/maybe/maybe'
import { getMessage } from 'src/utils/getMessage'

export const sendhi = async (
  interaction: ChatInputCommandInteraction<CacheType>,
  logger: LoggerService,
  client: Client,
): Promise<void> => {
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
      .asyncMap(([sticker, message]) => message.reply({ stickers: [sticker] }))

    interaction.reply({ ephemeral: true, content: 'hi was send' })
  } catch (e) {
    logger.error(`error occured: ${e}`)
  }
}
