import { EventEmitter } from 'events';
import { Client } from './client';
import { Rpc } from './rpc';
import { Presence } from './presence';
import { Components } from './components';
import { Metadata } from './metadata';

export interface TransportOptions {
  presenceTracking?: boolean;
}

export declare interface Transport {
  on(event: 'onlineChange', cb: (online: boolean) => void): this;
  once(event: 'onlineChange', cb: (online: boolean) => void): this;
  on(event: 'error', cb: (error: Error) => void): this;
  once(event: 'error', cb: (error: Error) => void): this;
}

export class Transport extends EventEmitter {
  private readonly client: Client;
  public readonly rpc: Rpc;
  public readonly presence: Presence;
  public readonly components: Components;
  public readonly metadata: Metadata;

  constructor(private readonly instanceName: string, serverUrl: string, options: TransportOptions = {}) {
    super();

    this.client = new Client(instanceName, serverUrl);

    this.client.on('onlineChange', (online) => this.emit('onlineChange', online));
    this.client.on('error', err => this.emit('error', err));

    this.rpc = new Rpc(this.client, options);
    this.presence = new Presence(this.client, options);
    this.components = new Components(this.client, options);
    this.metadata = new Metadata(this.client, options);
  }

  get online(): boolean {
    return this.client.online;
  }

  async terminate(): Promise<void> {
    await this.client.terminate();
  }
}
