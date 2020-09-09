import { Readable } from 'stream';
import { logger, tools } from 'mylife-home-common';
import { Service, BuildParams } from './types';
import { Services } from '.';
import { Session, SessionNotifier, SessionFeature } from './session-manager';

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
  };
}

class SessionNotifiers implements SessionFeature {
  private readonly notifierIds = new Set<string>();

  private static getFromSession(session: Session, createIfNotExist = true) {
    const FEATURE_NAME = 'logging/notifiers';
    const existing = session.findFeature(FEATURE_NAME);
    if(existing) {
      return existing as SessionNotifiers;
    }

    const feature = new SessionNotifiers();
    session.addFeature(FEATURE_NAME, feature);
    return feature;
  }

  static addNotifierId(session: Session, id: string) {
    SessionNotifiers.getFromSession(session).notifierIds.add(id);
  }

  static removeNotifierId(session: Session, id: string) {
    SessionNotifiers.getFromSession(session).notifierIds.delete(id);
  }

  static getNotifierIds(session: Session) {
    const feature = SessionNotifiers.getFromSession(session, false);
    return feature ? [...feature.notifierIds] : [];
  }
}

export class Logging implements Service {
  private readonly stream: Readable;
  private readonly buffer = new CircularBuffer<LogRecord>(1000);
  private readonly notifiers = new Map<string, SessionNotifier>();

  constructor(params: BuildParams) {
    this.stream = params.transport.logger.createAggregatedReadableStream();

    this.stream.on('data', (chunk: Buffer) => {
      const record = parseRecord(chunk);
      if (!record) {
        return;
      }

      this.buffer.push(record);

      for (const notifier of this.notifiers.values()) {
        notifier.notify(record);
      }
    });
  }

  async init() {
    Services.instance.sessionManager.registerSessionHandler(this.sessionHandler);
    Services.instance.sessionManager.registerServiceHandler('logging/start-notify-logs', this.startNotifyLogs);
    Services.instance.sessionManager.registerServiceHandler('logging/stop-notify-logs', this.stopNotifyLogs);
  }

  async terminate() {
    this.stream.destroy();
    this.buffer.clear();
  }

  private sessionHandler = (session: Session, type: 'new' | 'close') => {
    if (type !== 'close') {
      return;
    }

    for(const id of SessionNotifiers.getNotifierIds(session)) {
      this.notifiers.delete(id);
    }
  };

  private startNotifyLogs = async (session: Session) => {
    const notifier = session.createNotifier('logging/logs');
    this.notifiers.set(notifier.id, notifier);
    SessionNotifiers.addNotifierId(session, notifier.id);

    for (const record of this.buffer.toArray()) {
      notifier.notify(record);
    }

    return { notifierId: notifier.id };
  };

  private stopNotifyLogs = async (session: Session, { notifierId }: { notifierId: string; }) => {
    this.notifiers.delete(notifierId);
    SessionNotifiers.removeNotifierId(session, notifierId);
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