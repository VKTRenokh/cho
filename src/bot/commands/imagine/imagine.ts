import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  AttachmentBuilder,
} from 'discord.js'
import { Command } from '../command'
import { createCanvas } from 'canvas'
import { Maybe } from 'src/utils/maybe'
import { createGetStringOption } from 'src/utils/get-string-option'

const textKey = 'text'
const backgroundKey = 'background'
const textColorKey = 'text-color'

export class Imagine extends Command {
  private readonly defaultWidth = 500
  private readonly defaultHeight = 500

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
        .toJSON(),
      (interaction) => this.handle(interaction),
    )
  }

  private draw(
    interaction: ChatInputCommandInteraction,
    text: string,
    background: Maybe<string>,
    textColor: Maybe<string>,
  ) {
    const canvas = createCanvas(this.defaultWidth, this.defaultHeight)

    const ctx = canvas.getContext('2d')

    ctx.fillStyle = background.getOrElse('white')
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    this.logger.log(`${canvas.width / canvas.height}`)
    ctx.font = `${30}px Victor Mono NFM`

    const textMetrics = ctx.measureText(text)

    ctx.fillStyle = textColor.getOrElse('black')
    ctx.fillText(
      text,
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

    getOption(textKey).map((text) =>
      this.draw(
        interaction,
        text,
        getOption(backgroundKey),
        getOption(textColorKey),
      ),
    )
  }
}
