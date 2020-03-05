import { EventEmitter } from 'events';
import { Client } from './client';
import * as encoding from './encoding';
import { fireAsync } from '../tools';

export declare interface Presence {
  on(event: 'instanceChange', cb: (instanceName: string, online: boolean) => void): this;
  once(event: 'instanceChange', cb: (instanceName: string, online: boolean) => void): this;
}

export class Presence extends EventEmitter {

  private readonly onlineInstances = new Set<string>();

  constructor(private readonly client: Client) {
    super();

    this.client.on('onlineChange', online => this.onOnlineChange(online));
    this.client.on('message', (topic, payload) => this.onMessage(topic, payload));

    fireAsync(() => this.client.subscribe('+/online'));
  }

  public isOnline(instanceName: string) {
    return this.onlineInstances.has(instanceName);
  }

  public getOnlines() {
    return Array.from(this.onlineInstances);
  }

  private onOnlineChange(online: boolean): void {
    // no online instances anymore
    for (const instanceName of this.onlineInstances) {
      this.instanceChange(instanceName, false);
    }
  }

  private onMessage(topic: string, payload: Buffer): void {
    const path = topic.split('/');
    if (path.length < 2 || path[1] !== 'online') {
      return;
    }

    const instanceName = path[0];
    const online = encoding.readBool(payload);

    if (instanceName === this.client.instanceName) {
      return;
    }

    this.instanceChange(instanceName, online);
  }

  private instanceChange(instanceName: string, online: boolean): void {
    if (online) {
      if (this.onlineInstances.has(instanceName)) {
        return;
      }
      this.onlineInstances.add(instanceName);
    } else {
      if (!this.onlineInstances.delete(instanceName)) {
        return;
      }
    }

    this.emit('instanceChange', instanceName, online);
  }
}