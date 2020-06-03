import path from 'path';
import readConfig from 'read-config';
import { getArg } from './args';
import * as logger from '../logger';

const log = logger.createLogger('mylife:home:common:tools:config');

let cachedConfig: any;

export function getConfig() {
  if (!cachedConfig) {
    cachedConfig = loadConfig();
  }

  return cachedConfig;
}

export function injectConfig(value: any) {
  cachedConfig = value;
}

function loadConfig(): any {
  // __dirname correspond to root directory in bundle
  const configFile = path.resolve(__dirname, getArg('config', 'config.json'));
  log.debug(`reading configuration in '${configFile}'`);
  return readConfig(configFile);
}
