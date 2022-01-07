import { logger } from 'mylife-home-common';

const log = logger.createLogger('mylife:home:collector:database:writer');

export class Writer<T> {
  constructor(private readonly collectionName: string) {

  }

  async init() {
  }

  async terminate() {
  }

  write(object: T) {
    // TODO

    // TODO: use real dates (logging.time, history.timestamp)
    console.log('WRITE', this.collectionName, object);
  }
}
