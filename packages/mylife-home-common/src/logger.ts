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
  const config = getConfigItem<RotatingFileStream.options>('logging', true);
  if(!config) {
    return;
  }
  addStream({ stream: new RotatingFileStream(config) });
}