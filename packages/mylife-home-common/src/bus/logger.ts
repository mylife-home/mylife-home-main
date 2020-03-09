import { Client } from './client';
import { TransportOptions } from './transport';
import { Writable, WritableOptions, Readable, ReadableOptions } from 'stream';
import { fireAsync } from '../tools';

const DOMAIN = 'logger';
const DEFAULT_OFFLINE_RETENTION = 1 * 1024 * 1024;

class PublishStream extends Writable {
  private readonly offlineQueue: Buffer[] = [];
  private readonly topic = this.client.buildTopic(DOMAIN);

  constructor(private readonly client: Client, private readonly offlineRetention: number = DEFAULT_OFFLINE_RETENTION, options?: WritableOptions) {
    super(options);

    this.client.on('onlineChange', online => this.onOnlineChange(online));
  }

  _write(chunk: any, encoding: string, callback: (error?: Error | null) => void) {
    this.send(chunk).then(() => callback(), reason => callback(reason));
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

export class Logger {
  constructor(private readonly client: Client, options: TransportOptions) {
  }

  createWritableStream(): Writable {
    return new PublishStream(this.client);
  }

  createAggregatedReadableStream(): Readable {
    throw new Error('TODO');
  }
}
