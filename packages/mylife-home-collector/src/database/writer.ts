import { logger } from 'mylife-home-common';

const log = logger.createLogger('mylife:home:collector:database:writer');

export class Writer<T> {
  constructor(collectionName: string) {

  }

  async init() {
  }

  async terminate() {
  }

  write(object: T) {
    // TODO
    console.log('WRITE', object);
  }
}
