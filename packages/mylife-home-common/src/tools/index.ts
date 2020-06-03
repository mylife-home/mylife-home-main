import * as logger from '../logger';

export * from './config';
export * from './args';

const log = logger.createLogger('mylife:home:common:tools');

export function fireAsync(target: () => Promise<void>): void {
  target().catch((err) => log.error(err, 'Error on fireAsync'));
}

export async function sleep(delay: number) {
  await new Promise(resolve => setTimeout(resolve, delay));
}
