import { Writable } from 'stream';
import Logger from 'bunyan';
import RotatingFileStream from 'bunyan-rotating-file-stream';
import { getConfigItem } from './tools';

const loggers: Logger[] = [];
const streams: Logger.Stream[] = [];
const fields: { [name: string]: any } = {};

export function createLogger(name: string) {
  const logger = Logger.createLogger({ name, streams, ...fields });
  loggers.push(logger);
  return logger;
}

export function addField(name: string, value: any) {
  fields[name] = value;

  for (const logger of loggers) {
    logger.fields[name] = value;
  }
}

export function addStream(stream: Logger.Stream) {
  streams.push(stream);

  for (const logger of loggers) {
    logger.addStream(stream);
  }
}

export function readConfig() {
  interface LoggingConfig {
    readonly console?: boolean;
    readonly file?: RotatingFileStream.options;
  }

  const config = getConfigItem<LoggingConfig>('logging', true);
  if (!config) {
    return;
  }

  if (config.console) {
    addStream({
      stream: process.stdout,
      closeOnExit: false,
      level: Logger.DEBUG,
    });

    // https://github.com/trentm/node-bunyan/issues/491#issuecomment-350327630
    process.stdout.on('error', (err: any) => {
      if (err.code === 'EPIPE') {
        // ignore
      } else {
        throw err;
      }
    });
  }

  if (config.file) {
    addStream({
      stream: new RotatingFileStream(config.file),
      level: Logger.DEBUG,
    });
  }
}
