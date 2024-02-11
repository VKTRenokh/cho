import {
  ChatInputCommandInteraction,
  AttachmentBuilder,
  Client,
} from 'discord.js'
import { Command } from '../command'
import { CanvasRenderingContext2D, createCanvas, loadImage } from 'canvas'
import { Maybe, maybe } from 'src/utils/maybe'
import { Options } from 'src/utils/get-string-option'
import {
  backgroundKey,
  fontSizeKey,
  heightKey,
  imageBackgroundKey,
  textColorKey,
  textKey,
  userKey,
  widthKey,
} from './constants/option-keys'
import {
  maxCanvasHeight,
  maxCanvasWidth,
  minCanvasHeight,
  minCanvasWidth,
} from './constants/width-height'
import { createCommand } from './utils/create-command'
import { webpBufferToJpegBuffer } from './utils/webp-buffer-to-jpeg-buffer'

export class Imagine extends Command {
  private readonly defaultWidth = '500'
  private readonly defaultHeight = '500'

  constructor(key: string) {
    super(createCommand(key), (interaction, logger, client) =>
      this.handle(interaction, client),
    )
  }

  private createCanvas(
    width: Maybe<string>,
    height: Maybe<string>,
    interaction: ChatInputCommandInteraction,
  ) {
    const w = +width.getOrElse(this.defaultWidth)
    const h = +height.getOrElse(this.defaultHeight)

    if (w <= minCanvasWidth || h <= minCanvasHeight) {
      interaction.reply({
        ephemeral: true,
        content: 'height or width cannot be 0',
      })
      throw new Error('0 height 0 width')
    }

    const safeWidth = w > maxCanvasWidth ? maxCanvasWidth : w
    const safeHeight = h > maxCanvasHeight ? maxCanvasHeight : h

    return createCanvas(safeWidth, safeHeight)
  }

  private async drawUserAvatar(
    id: Maybe<string>,
    ctx: CanvasRenderingContext2D,
    client: Client,
  ) {
    const user = await id.asyncMap(async (id) => await client.users.fetch(id))

    await (
      await (
        await (
          await (
            await user
              .fmap((user) => maybe(user.avatarURL()))
              .asyncMap(async (url) => await fetch(url))
          ).asyncMap(async (response) => await response.arrayBuffer())
        )
          .map((arrayBuffer) => Buffer.from(arrayBuffer))
          .asyncMap(async (buffer) => await webpBufferToJpegBuffer(buffer))
      ).asyncMap(async (buffer) => await loadImage(buffer))
    ).map((image) => ctx.drawImage(image, 0, 0))
  }

  private async draw(
    interaction: ChatInputCommandInteraction,
    client: Client,
    text: string,
    option: Options,
  ) {
    const canvas = this.createCanvas(
      option.string(widthKey),
      option.string(heightKey),
      interaction,
    )

    option.attachment(imageBackgroundKey).map(console.log)

    const ctx = canvas.getContext('2d')

    ctx.fillStyle = option.string(backgroundKey).getOrElse('white')
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const fontSize = option.string(fontSizeKey).getOrElse('50')
    ctx.font = `${fontSize}px Victor Mono NFM`

    await this.drawUserAvatar(option.string(userKey), ctx, client)

    const textMetrics = ctx.measureText(text)

    ctx.fillStyle = option.string(textColorKey).getOrElse('black')

    ctx.fillText(
      text,
      canvas.width / 2 - textMetrics.width / 2,
      canvas.height / 2,
    )

    interaction.reply({
      files: [new AttachmentBuilder(canvas.createJPEGStream())],
    })
  }

  private handle(interaction: ChatInputCommandInteraction, client: Client) {
    const getOption = new Options(interaction)

    getOption
      .string(textKey)
      .map((text) => this.draw(interaction, client, text, getOption))
  }
}
