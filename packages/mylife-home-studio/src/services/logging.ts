import { Readable } from 'stream';
import { logger, bus } from 'mylife-home-common';
import { Service, BuildParams } from './types';
import { EventEmitter } from 'events';

const log = logger.createLogger('mylife:home:studio:services:logging');

export interface LogRecord {
  name: string;
  instanceName: string;
  hostname: string;
  pid: number;
  level: number;
  msg: string;
  time: string;
  v: number;
  err?: {
    message: string;
    name: string;
    stack: string;
  }
}

export class Logging implements Service {
  private readonly stream: Readable;
  private readonly buffer = new CircularBuffer<LogRecord>(1000);

  constructor(params: BuildParams) {
    this.stream = params.transport.logger.createAggregatedReadableStream();

    this.stream.on('data', (chunk: Buffer) => {
      try {
        this.buffer.push(JSON.parse(chunk.toString()) as LogRecord);
      } catch(err) {
        log.error(err, 'Cannot parse stream chunk');
      }
    });
  }

  async init() {
  }

  async terminate() {
    this.stream.destroy();
    this.buffer.clear();
  }
}

// https://github.com/vinsidious/circularbuffer/blob/master/src/CircularBuffer.ts
class CircularBuffer<T> extends EventEmitter {
  private readonly buffer: T[] = [];

  constructor(public readonly capacity: number) {
    super();
  }

  push(item: T) {
    if (this.buffer.length === this.capacity) {
      this.buffer.shift();
    }

    this.buffer.push(item);
    this.emit('mew-item', item);
  }

  toArray() {
    return [...this.buffer];
  }

  clear() {
    this.buffer.splice(0, this.buffer.length);
  }

  get size() {
    return this.buffer.length;
  }
}
