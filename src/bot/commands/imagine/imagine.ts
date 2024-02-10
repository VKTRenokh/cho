import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  AttachmentBuilder,
} from 'discord.js'
import { Command } from '../command'
import { createCanvas } from 'canvas'
import { Maybe } from 'src/utils/maybe'
import { createGetStringOption } from 'src/utils/get-string-option'
import {
  backgroundKey,
  fontSizeKey,
  heightKey,
  textColorKey,
  textKey,
  widthKey,
} from './constants/option-keys'

export class Imagine extends Command {
  private readonly defaultWidth = '500'
  private readonly defaultHeight = '500'

  constructor(key: string) {
    super(
      new SlashCommandBuilder()
        .setName(key)
        .setDescription('hello world')
        .addStringOption((option) =>
          option
            .setName(textKey)
            .setDescription('what to write')
            .setRequired(true),
        )
        .addStringOption((option) =>
          option.setName(backgroundKey).setDescription('background color'),
        )
        .addStringOption((option) =>
          option.setName(textColorKey).setDescription('text background'),
        )
        .addStringOption((option) =>
          option.setName(fontSizeKey).setDescription('font size in pixels'),
        )
        .addNumberOption((option) =>
          option.setName(widthKey).setDescription('image width'),
        )
        .addNumberOption((option) =>
          option.setName(heightKey).setDescription('image height'),
        )
        .toJSON(),
      (interaction) => this.handle(interaction),
    )
  }

  private createCanvas(
    width: Maybe<string>,
    height: Maybe<string>,
    interaction: ChatInputCommandInteraction,
  ) {
    const w = +width.getOrElse(this.defaultWidth)
    const h = +height.getOrElse(this.defaultHeight)

    if (w <= 0 || h <= 0) {
      interaction.reply({
        ephemeral: true,
        content: 'height or width cannot be 0',
      })
      throw new Error('0 height 0 width')
    }

    const safeWidth = w > 2000 ? 2000 : w
    const safeHeight = h > 2000 ? 2000 : h

    return createCanvas(safeWidth, safeHeight)
  }

  private draw(
    interaction: ChatInputCommandInteraction,
    text: string,
    option: (key: string) => Maybe<string>,
  ) {
    const canvas = this.createCanvas(
      option(widthKey),
      option(heightKey),
      interaction,
    )

    const ctx = canvas.getContext('2d')

    ctx.fillStyle = option(backgroundKey).getOrElse('white')
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.font = `${option(fontSizeKey).getOrElse('30')}px Victor Mono NFM`

    const textMetrics = ctx.measureText('igor pidr')

    ctx.fillStyle = option(textColorKey).getOrElse('black')

    ctx.fillText(
      'igor pidr',
      canvas.width / 2 - textMetrics.width / 2,
      canvas.height / 2,
    )

    const stream = canvas.createJPEGStream()

    const attachment = new AttachmentBuilder(stream)

    interaction.reply({
      files: [attachment],
    })
  }

  private handle(interaction: ChatInputCommandInteraction) {
    const getOption = createGetStringOption(interaction)

    getOption(textKey).map((text) => this.draw(interaction, text, getOption))
  }
}
