/**
 * Logger utility for the MCP server
 * Provides structured logging for debugging and monitoring
 */

enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

class Logger {
  private logLevel: LogLevel = LogLevel.INFO;

  constructor() {
    const envLevel = process.env.LOG_LEVEL || 'INFO';
    this.logLevel = LogLevel[envLevel as keyof typeof LogLevel] || LogLevel.INFO;
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level}] ${message}${dataStr}`;
  }

  error(message: string, error?: any): void {
    console.error(this.formatMessage(LogLevel.ERROR, message, error));
  }

  warn(message: string, data?: any): void {
    if (this.canLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.canLog(LogLevel.INFO)) {
      console.log(this.formatMessage(LogLevel.INFO, message, data));
    }
  }

  debug(message: string, data?: any): void {
    if (this.canLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage(LogLevel.DEBUG, message, data));
    }
  }

  private canLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentIndex = levels.indexOf(this.logLevel);
    const messageIndex = levels.indexOf(level);
    return messageIndex <= currentIndex;
  }
}

export const logger = new Logger();
