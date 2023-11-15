import { FgGreen, FgRed, FgYellow, Reset } from '../contsants/colors'

export class LoggerService {
  constructor(
    public name: string,
    public logFilePath?: string,
  ) {}

  public warn(message: string): void {
    process.stdout.write(
      `\n${new Date()}    ${FgYellow}WARN ${FgYellow}[ ${
        this.name
      } ] ${FgYellow}${message} ${Reset}`,
    )
  }

  public error(message: string): void
  public error(message: Error): void
  public error(message: unknown): void {
    process.stdout.write(
      `\n${new Date()}    ${FgRed}ERROR ${FgYellow}[ ${
        this.name
      } ] ${FgRed}${message} ${Reset}`,
    )
  }

  public log(message: string): void {
    process.stdout.write(
      `\n${new Date()}    ${FgGreen}LOG ${FgYellow}[ ${
        this.name
      } ] ${FgGreen}${message} ${Reset}`,
    )
  }
}
