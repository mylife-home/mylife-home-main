import path from 'path';
import readConfig from 'read-config';
import { getArg } from './args';

let cachedConfig: { [name: string]: any; };

export function getConfig() {
  if (!cachedConfig) {
    cachedConfig = loadConfig();
  }

  return cachedConfig;
}

export function getConfigItem<T>(name: string, optional: boolean = false): T {
  const item = getConfig()[name];
  if (item === undefined && !optional) {
    throw new Error(`Missing configuration item: '${name}'`);
  }
  return item as T;
}

export function injectConfig(value: { [name: string]: any; }) {
  cachedConfig = value;
}

function loadConfig(): any {
  // __dirname correspond to root directory in bundle
  const defaultConfig = path.join(__dirname, 'config.json');
  const configFile = path.resolve(getArg('config', defaultConfig));
  return readConfig(configFile);
}
