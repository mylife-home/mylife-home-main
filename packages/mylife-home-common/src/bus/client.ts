import { EventEmitter } from 'events';
import * as mqtt from 'async-mqtt';
import * as encoding from './encoding';
import { fireAsync } from '../tools';

export declare interface Client {
  on(event: 'onlineChange', cb: (online: boolean) => void): this;
  once(event: 'onlineChange', cb: (online: boolean) => void): this;

  on(event: 'message', cb: (topic: string, payload: Buffer) => void): this;
  once(event: 'message', cb: (topic: string, payload: Buffer) => void): this;

  on(event: 'error', cb: (error: Error) => void): this;
  once(event: 'error', cb: (error: Error) => void): this;
}

export class Client extends EventEmitter {
  private readonly client: mqtt.AsyncClient;
  private _online: boolean = false;
  private readonly subscriptions = new Set<string>();

  constructor(public readonly instanceName: string, serverUrl: string) {
    super();

    // TODO mqtt release: remove toString(), qos
    const qos: mqtt.QoS = 0;
    const will = { topic: this.buildTopic('online'), payload: encoding.writeBool(false).toString(), retain: false, qos };
    this.client = mqtt.connect(serverUrl, { will });

    this.client.on('connect', () => fireAsync(async () => {
      await this.publish(this.buildTopic('online'), encoding.writeBool(true), true);
      this.onlineChange(true);
    }));

    this.client.on('close', () => this.onlineChange(false));

    this.client.on('error', err => {
      console.error('mqtt error', err); // TODO: logging
      this.emit('error', err);
    });

    this.client.on('message', (topic, payload) => this.emit('message', topic, payload));
  }

  private onlineChange(value: boolean): void {
    if (value === this._online) {
      return;
    }
    this._online = value;
    this.emit('onlineChange', value);

    if(this.online) {
      fireAsync(async () => {
        if(this.subscriptions.size) {
          await this.client.subscribe(Array.from(this.subscriptions));
        }
      });
    }
  }

  get online(): boolean {
    return this._online;
  }

  async terminate(): Promise<void> {
    if (this.client.connected) {
      await this.client.publish(this.buildTopic('online'), encoding.writeBool(false));
    }
    await this.client.end(true);
  }

  public buildTopic(domain: string, ...args: string[]): string {
    const finalArgs = [this.instanceName, domain, ...args];
    return finalArgs.join('/');
  }

  public buildRemoteTopic(targetInstance: string, domain: string, ...args: string[]): string {
    const finalArgs = [targetInstance, domain, ...args];
    return finalArgs.join('/');
  }

  async publish(topic: string, payload: Buffer, retain: boolean = false) {
    // TODO mqtt release: remove qos
    await this.client.publish(topic, payload, { retain, qos: 0 });
  }

  async subscribe(topic: string | string[]) {
    if(!Array.isArray(topic)) {
      topic = [topic];
    }
    for(const item of topic) {
      this.subscriptions.add(item);
    }
    if(this.online) {
      await this.client.subscribe(topic);
    }
  }

  async unsubscribe(topic: string | string[]) {
    if(!Array.isArray(topic)) {
      topic = [topic];
    }
    for(const item of topic) {
      this.subscriptions.delete(item);
    }
    if(this.online) {
      await this.client.unsubscribe(topic);
    }
  }
}
