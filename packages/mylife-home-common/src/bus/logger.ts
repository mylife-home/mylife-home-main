import BunyanLogger from 'bunyan';
import { Client } from './client';
import { TransportOptions } from './transport';
import { Writable, WritableOptions, Readable, PassThrough, TransformOptions } from 'stream';
import { fireAsync } from '../tools';
import { addStream } from '../logger';

const DOMAIN = 'logger';
const DEFAULT_OFFLINE_RETENTION = 1 * 1024 * 1024;

class PublishStream extends Writable {
  private readonly offlineQueue: Buffer[] = [];
  private readonly topic = this.client.buildTopic(DOMAIN);

  constructor(private readonly client: Client, private readonly offlineRetention: number, options?: WritableOptions) {
    super(options);

    this.client.on('onlineChange', online => this.onOnlineChange(online));
  }

  _write(chunk: any, encoding: string, callback: (error?: Error | null) => void) {
    promiseToCallback(this.send(chunk), callback);
  }

  private async send(chunk: Buffer) {
    if (this.client.online) {
      await this.client.publish(this.topic, chunk);
    } else {
      this.enqueue(chunk);
    }
  }

  private enqueue(chunk: Buffer) {
    const size = this.offlineQueue.reduce((prev, current) => prev + current.length, 0);
    if (size > this.offlineRetention) {
      console.error(`logging chunk dropped because size exceeded ${size}`); // TODO logging
      return;
    }

    this.offlineQueue.push(chunk);
  }

  private onOnlineChange(online: boolean) {
    if (!online) {
      return;
    }

    fireAsync(async () => {
      while (this.client.online && this.offlineQueue.length) {
        const chunk = this.offlineQueue.shift();
        await this.client.publish(this.topic, chunk);
      }
    });
  }
}

class SubscribeStream extends PassThrough {

  private readonly topic = this.client.buildRemoteTopic('+', DOMAIN);

  constructor(private readonly client: Client, options?: TransformOptions) {
    super(options);
    fireAsync(async () => this.init());
  }

  _destroy(error: Error | null, callback: (error?: Error | null) => void): void {
    promiseToCallback(this.terminate(), callback);
  }

  private async init() {
    this.client.on('message', this.onMessage);
    await this.client.subscribe(this.topic);
  }

  private async terminate() {
    this.client.off('message', this.onMessage);
    await this.client.unsubscribe(this.topic);
  }

  private readonly onMessage = (topic: string, payload: Buffer) => {
    const parts = topic.split('/');
    if (parts.length !== 2 || parts[1] !== DOMAIN) {
      return;
    }

    this.write(payload);
  }

}

export class Logger {
  private readonly offlineRetention: number;

  constructor(private readonly client: Client, options: TransportOptions) {
    this.offlineRetention = options.loggerOfflineRetention || DEFAULT_OFFLINE_RETENTION;

    addStream({
      stream: this.createWritableStream(),
      level: BunyanLogger.DEBUG,
    });
  }

  private createWritableStream(): Writable {
    return new PublishStream(this.client, this.offlineRetention);
  }

  createAggregatedReadableStream(): Readable {
    const stream = new SubscribeStream(this.client);
    return stream;
  }
}

function promiseToCallback<T>(promise: Promise<T>, callback: (error?: Error, result?: T) => void) {
  promise.then(result => callback(null, result), error => callback(error));
}