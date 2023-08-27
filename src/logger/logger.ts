import { FgGreen, FgRed, FgYellow, Reset } from "../contsants/colors";
import { logLevel } from "../types/logLevel";

declare class Logger {
  public logLevel: logLevel;
  public name: string;
  public logFilePath?: string;

  public isLevelEnabled(level: logLevel): boolean;
  public warn(message: string): void;
  public error(message: string): void;
  public error(message: Error): void;
  public error(message: unknown): void;
  public log(message: string): void;
}

export class LoggerService implements Logger {
  constructor(
    public name: string,
    public logLevel: logLevel,
    public logFilePath?: string
  ) {}

  isLevelEnabled(level: logLevel) {
    return level >= this.logLevel;
  }

  public warn(message: string): void {
    process.stdout.write(
      `\n${new Date()}    ${FgYellow}WARN ${FgYellow}[ ${
        this.name
      } ] ${FgYellow}${message} ${Reset}`
    );
  }

  public error(message: string): void;
  public error(message: Error): void;
  public error(message: unknown): void;
  public error(message: unknown): void {
    process.stdout.write(
      `\n${new Date()}    ${FgRed}ERROR ${FgYellow}[ ${
        this.name
      } ] ${FgRed}${message} ${Reset}`
    );
  }

  public log(message: string): void {
    process.stdout.write(
      `\n${new Date()}    ${FgGreen}LOG ${FgYellow}[ ${
        this.name
      } ] ${FgGreen}${message} ${Reset}`
    );
  }
}
