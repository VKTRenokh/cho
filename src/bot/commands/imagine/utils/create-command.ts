import { SlashCommandBuilder } from 'discord.js'
import {
  maxCanvasHeight,
  maxCanvasWidth,
  minCanvasHeight,
  minCanvasWidth,
} from '../constants/width-height'
import {
  backgroundKey,
  fontSizeKey,
  heightKey,
  textColorKey,
  textKey,
  userKey,
  widthKey,
} from '../constants/option-keys'

export const createCommand = (key: string) =>
  new SlashCommandBuilder()
    .setName(key)
    .setDescription('hello world')
    .addStringOption((option) =>
      option.setName(textKey).setDescription('what to write').setRequired(true),
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
      option
        .setName(widthKey)
        .setDescription('image width')
        .setMinValue(minCanvasWidth)
        .setMaxValue(maxCanvasWidth),
    )
    .addNumberOption((option) =>
      option
        .setName(heightKey)
        .setDescription('image height')
        .setMinValue(minCanvasHeight)
        .setMaxValue(maxCanvasHeight),
    )
    .addUserOption((option) => option.setName(userKey).setDescription('avatar'))
    .toJSON()
