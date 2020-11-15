import os from 'os';
import * as logger from '../logger';
import * as instanceInfo from '../instance-info';
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

export async function nextTick() {
  await new Promise(resolve => setImmediate(resolve));
}

export function init(mainComponent: string) {
  setDefine('main-component', mainComponent);

  const instanceName = getConfig().instanceName || `${os.hostname()}-${mainComponent}`;
  setDefine('instance-name', instanceName);

  logger.addField('instanceName', instanceName);
  logger.readConfig();

  instanceInfo.init();
}

export class Deferred<T> {
  public promise: Promise<T>;

  private _resolve: (value: T) => void;
  private _reject: (reason: Error) => void;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  resolve(value: T) {
    this._resolve(value);
  }

  reject(reason: Error) {
    this._reject(reason);
  }
}
