import { Readable } from 'stream';
import { bus } from 'mylife-home-common';
import { Service } from './types';

export class Logging implements Service {
  private readonly stream: Readable;

  constructor(transport: bus.Transport) {
    this.stream = transport.logger.createAggregatedReadableStream();

    this.stream.on('data', (chunk: Buffer) => {
      console.log(chunk);
    });
  }

  async init() {
  }

  async terminate() {
    this.stream.destroy();
  }
}
