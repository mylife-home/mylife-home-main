import { Readable } from 'stream';
import { logger } from 'mylife-home-common';
import { LogRecord } from '../../shared/logging';
import { Service, BuildParams } from './types';
import { Services } from '.';
import { Session, SessionNotifierManager } from './session-manager';

const log = logger.createLogger('mylife:home:studio:services:logging');

export class Logging implements Service {
  private readonly stream: Readable;
  private readonly buffer = new CircularBuffer<LogRecord>(1000);
  private readonly notifiers = new SessionNotifierManager('logging/notifiers', 'logging/logs');

  constructor(params: BuildParams) {
    this.stream = params.transport.logger.createAggregatedReadableStream();

    this.stream.on('data', (chunk: Buffer) => {
      const record = parseRecord(chunk);
      if (!record) {
        return;
      }

      this.buffer.push(record);
      this.notifiers.notifyAll(record);
    });
  }

  async init() {
    this.notifiers.init();
    Services.instance.sessionManager.registerServiceHandler('logging/start-notify-logs', this.startNotifyLogs);
    Services.instance.sessionManager.registerServiceHandler('logging/stop-notify-logs', this.stopNotifyLogs);
  }

  async terminate() {
    this.stream.destroy();
    this.buffer.clear();
  }

  private startNotifyLogs = async (session: Session) => {
    const notifier = this.notifiers.createNotifier(session);

    // send events after we reply
    const records = this.buffer.toArray();
    setImmediate(() => {
      for (const record of records) {
        notifier.notify(record);
      }
    });

    return { notifierId: notifier.id };
  };

  private stopNotifyLogs = async (session: Session, { notifierId }: { notifierId: string; }) => {
    this.notifiers.removeNotifier(session, notifierId);
  };
}

// https://github.com/vinsidious/circularbuffer/blob/master/src/CircularBuffer.ts
class CircularBuffer<T> {
  private readonly buffer: T[] = [];

  constructor(public readonly capacity: number) {
  }

  push(item: T) {
    if (this.buffer.length === this.capacity) {
      this.buffer.shift();
    }

    this.buffer.push(item);
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

function parseRecord(chunk: Buffer) {
  try {
    return JSON.parse(chunk.toString()) as LogRecord;
  } catch (err) {
    log.error(err, 'Cannot parse stream chunk');
    return null;
  }
}