import { ChatInputCommandInteraction } from 'discord.js'
import { LoggerService } from 'src/logger/logger'
import { randomInt } from 'node:crypto'
import { kickNum, maxKickNum } from 'src/contsants/constants'
import { maybe } from 'src/utils/maybe'

export const maybeKick = async (
  interaction: ChatInputCommandInteraction,
  logger: LoggerService,
): Promise<boolean> => {
  const int = randomInt(maxKickNum)

  logger.log(`random kick int is ${int}, remains ${int - kickNum}`)

  if (int === kickNum) {
    const member = await maybe(interaction.guild).asyncMap(
      async (guild) => await guild.members.fetch(interaction.user.id),
    )

    member.map((member) => {
      member.kick('kicked by rofls; there nothing we can do')

      interaction.channel?.send(
        `${member.nickname} дорофлился находясь на сервере c ${
          member.joinedAt
        } по ${new Date()}`,
      )
    })

    return true
  }

  return false
}
