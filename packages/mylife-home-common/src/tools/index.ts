import os from 'os';
import * as logger from '../logger';
import { setDefine } from './defines';
import { getConfig } from './config';

export * from './config';
export * from './args';
export * from './defines';

const log = logger.createLogger('mylife:home:common:tools');

export function fireAsync(target: () => Promise<void>): void {
  target().catch((err) => log.error(err, 'Error on fireAsync'));
}

export async function sleep(delay: number) {
  await new Promise(resolve => setTimeout(resolve, delay));
}

export function init(mainComponent: string) {
  setDefine('main-component', mainComponent);

  const instanceName = getConfig().instanceName || `${os.hostname()}-${mainComponent}`;
  setDefine('instance-name', instanceName);
}