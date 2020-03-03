import { EventEmitter } from 'events';
import { Client } from './client';
import { Rpc } from './rpc';
import { Presence } from './presence';

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

  constructor(private readonly instanceName: string, serverUrl: string) {
    super();

    this.client = new Client(instanceName, serverUrl);
    
    this.client.on('onlineChange', (online) => this.emit('onlineChange', online));
    this.client.on('error', err => this.emit('error', err));

    this.rpc = new Rpc(this.client);
    this.presence = new Presence(this.client);
  }

  get online(): boolean {
    return this.client.online;
  }

  async terminate(): Promise<void> {
    await this.client.terminate();
  }
}
