import { GatewayIntentBits, Partials } from 'discord.js'

export const rajiId = '282509088875872258'
export const legendaryRajiSlideId = '1167159653369647155'
export const legendaryServerId = '1125531614903009330'
export const legendaryChannelId = '1125531615481839658'

export const cats = [
  `
  ^~^  ,
 ('Y') )
 /   \\/
(\\|||/) hjkl
`,
  `
  |\\'/-..--.
 / _ _   ,  ;
\`~=\`Y'~_<._./
 <\`-....__.'
`,
] as const

export const intents = [
  GatewayIntentBits.DirectMessages,
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.GuildEmojisAndStickers,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.GuildInvites,
  GatewayIntentBits.GuildMembers,
]

export const partials = [
  Partials.Message,
  Partials.Reaction,
  Partials.GuildMember,
  Partials.Channel,
]

export const chocoStickerPackId = '847201503668207738'
export const chocoHelloStickerId = '781291131828699156'

export const maxKickNum = 1_000_000
export const kickNum = 845
