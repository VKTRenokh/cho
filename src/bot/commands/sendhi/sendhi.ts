import { CacheType, ChatInputCommandInteraction, Client } from 'discord.js'
import {
  chocoHelloStickerId,
  chocoStickerPackId,
  legendaryChannelId,
  legendaryRajiSlideId,
} from 'src/contsants/constants'
import { LoggerService } from 'src/logger/logger'
import { getMessage } from 'src/utils/getMessage'
import { maybe } from 'src/utils/maybe'

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
      .flatMap(maybe)

    await sticker
      .merge(message)
      .asyncMap((maybes) => maybes.right.reply({ stickers: [maybes.left] }))

    interaction.reply({ ephemeral: true, content: 'hi was send' })
  } catch (e) {
    logger.error(`error occured: ${e}`)
  }
}
