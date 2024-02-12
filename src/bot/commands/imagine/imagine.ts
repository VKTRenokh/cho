import {
  ChatInputCommandInteraction,
  AttachmentBuilder,
  Client,
  Attachment,
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
import { webpImageUrlToJpegBuffer } from 'src/utils/webp-image-url-to-jpeg-buffer'

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

    const image = await webpImageUrlToJpegBuffer(
      user.flatMap((user) => maybe(user.avatarURL())),
    )

    const canvas = await image.asyncMap(async (image) => await loadImage(image))

    canvas.map((canvas) => ctx.drawImage(canvas, 0, 0))
  }

  private async drawImageBackground(
    attachment: Maybe<Attachment>,
    ctx: CanvasRenderingContext2D,
  ) {
    const url = attachment.map((attachment) => attachment.url)

    const image = await webpImageUrlToJpegBuffer(url)

    const canvas = await image.asyncMap((image) => loadImage(image))

    canvas.map((canvas) => ctx.drawImage(canvas, 0, 0))
  }

  private parseMetrics(attachment: Maybe<Attachment>) {
    const width = attachment
      .flatMap((attachment) => maybe(attachment.width))
      .map((number) => number.toString())

    const height = attachment
      .flatMap((attachment) => maybe(attachment.height))
      .map((number) => number.toString())

    return { width, height }
  }

  private async draw(
    interaction: ChatInputCommandInteraction,
    client: Client,
    text: string,
    option: Options,
  ) {
    const attachment = option.attachment(imageBackgroundKey)
    const metrics = this.parseMetrics(attachment)

    const canvas = this.createCanvas(
      option.string(widthKey).flatGetOrElse(metrics.width),
      option.string(heightKey).flatGetOrElse(metrics.height),
      interaction,
    )
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = option.string(backgroundKey).getOrElse('white')
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    await this.drawImageBackground(attachment, ctx)

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
