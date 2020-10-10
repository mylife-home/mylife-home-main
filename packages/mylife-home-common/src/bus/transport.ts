import { EventEmitter } from 'events';
import { Client } from './client';
import { Rpc } from './rpc';
import { Presence } from './presence';
import { Components } from './components';
import { Metadata } from './metadata';
import { Logger } from './logger';
import * as instanceInfo from '../instance-info';
import { getConfigItem, getDefine, fireAsync } from '../tools';

interface BusConfiguration {
  readonly serverUrl: string;
  readonly instanceName?: string;
}

export interface TransportOptions {
  presenceTracking?: boolean;
  loggerOfflineRetention?: number;
  residentStateDelay?: number;
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
  public readonly logger: Logger;

  constructor(options: TransportOptions = {}) {
    super();

    const config = getConfigItem<BusConfiguration>('bus');
    const instanceName = getDefine<string>('instance-name');

    this.client = new Client(instanceName, config.serverUrl, options.residentStateDelay);

    this.client.on('onlineChange', (online) => this.emit('onlineChange', online));
    this.client.on('error', (err) => this.emit('error', err));

    this.rpc = new Rpc(this.client, options);
    this.presence = new Presence(this.client, options);
    this.components = new Components(this.client, options);
    this.metadata = new Metadata(this.client, options);
    this.logger = new Logger(this.client, options);

    this.client.on('onlineChange', (online) => {
      if (online) {
        fireAsync(() => this.metadata.set('instance-info', instanceInfo.get()));
      }
    });
  }

  get online(): boolean {
    return this.client.online;
  }

  async terminate(): Promise<void> {
    await this.client.terminate();
  }
}
