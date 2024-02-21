import { CacheType, ChatInputCommandInteraction, Client } from 'discord.js'
import {
  chocoHelloStickerId,
  chocoStickerPackId,
  legendaryChannelId,
  legendaryRajiSlideId,
} from 'src/contsants/constants'
import { LoggerService } from 'src/logger/logger'
import { getMessage } from 'src/utils/getMessage'
import { M } from '@victorenokh/maybe.ts'

export const sendhi = async (
  interaction: ChatInputCommandInteraction<CacheType>,
  logger: LoggerService,
  client: Client,
): Promise<void> => {
  try {
    const message = await getMessage(
      M.of(interaction.guild),
      legendaryChannelId,
      legendaryRajiSlideId,
    )

    const stickers = await client.fetchPremiumStickerPacks()

    const stickerPack = M.fromUndefined(stickers.get(chocoStickerPackId))

    const sticker = stickerPack.mapNullable((pack) =>
      pack.stickers.get(chocoHelloStickerId),
    )

    await sticker
      .merge(message)
      .asyncMap((maybes) => maybes.right.reply({ stickers: [maybes.left] }))

    interaction.reply({ ephemeral: true, content: 'hi was send' })
  } catch (e) {
    logger.error(`error occured: ${e}`)
  }
}
