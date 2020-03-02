import { EventEmitter } from 'events';
import { Client } from './client';
import { Rpc } from './rpc';

export declare interface Transport {
  on(event: 'onlineChange', cb: (online: boolean) => void): this;
  once(event: 'onlineChange', cb: (online: boolean) => void): this;
}

export class Transport extends EventEmitter {
  private readonly client: Client;
  public readonly rpc: Rpc;

  constructor(private readonly instanceName: string, serverUrl: string) {
    super();

    this.client = new Client(instanceName, serverUrl);
    
    this.client.on('onlineChange', (online) => this.emit('onlinChange', online));

    this.rpc = new Rpc(this.client);
  }

  get online(): boolean {
    return this.client.online;
  }

  async terminate(): Promise<void> {
    await this.client.terminate();
  }
}
