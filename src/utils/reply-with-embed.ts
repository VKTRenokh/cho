import { EmbedBuilder, Message } from 'discord.js'

export const replyWithEmbed =
  (message: Message): ((embed: EmbedBuilder) => EmbedBuilder) =>
  (embed) => (message.reply({ embeds: [embed] }), embed)
