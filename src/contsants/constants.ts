import { GatewayIntentBits, Partials } from "discord.js";

export const rajiId = "282509088875872258";
export const musicPath = "/mnt/sda1/enokh/workspace/rajiBot/";
export const animeGreetingGifUrl =
  "https://tenor.com/view/eromanga-sensei-hitorigoto-sagiri-eromangasensei-gif-20403999";
// export const legendaryRajiSlideId = "1125531659186491432";
export const legendaryRajiSlideId = "1167159653369647155";
export const legendaryServerId = "1125531614903009330";
export const legendaryChannelId = "1125531615481839658";

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
] as const;

export const intents = [
  GatewayIntentBits.DirectMessages,
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.GuildEmojisAndStickers,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.GuildInvites,
];

export const partials = [
  Partials.Message,
  Partials.Reaction,
  Partials.GuildMember,
  Partials.Channel,
];

export const chocoStickerPackId = "847201503668207738";
export const chocoHelloStickerId = "781291131828699156";
