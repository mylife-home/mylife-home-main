import path from 'path';
import readConfig from 'read-config';
import * as logger from './logger';

const log = logger.createLogger('mylife:home:common:tools');

export function fireAsync(target: () => Promise<void>): void {
  target().catch((err) => log.error(err, 'Error on fireAsync'));
}

export async function sleep(delay: number) {
  await new Promise(resolve => setTimeout(resolve, delay));
}

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
  const configFile = path.join(__dirname, 'config.json');
  log.debug(`reading configuration in '${configFile}'`);
  return readConfig(configFile);
}
