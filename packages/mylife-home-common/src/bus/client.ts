import { EventEmitter } from 'events';
import * as mqtt from 'async-mqtt';
import * as encoding from './encoding';
import { fireAsync } from '../tools';

export declare interface Client {
  on(event: 'onlineChange', cb: (online: boolean) => void): this;
  once(event: 'onlineChange', cb: (online: boolean) => void): this;
}

export class Client extends EventEmitter {
  private readonly client: mqtt.AsyncClient;
  private _online: boolean;

  constructor(private readonly instanceName: string, serverUrl: string) {
    super();

    // TODO mqtt release: remove toString(), qos
    const qos: mqtt.QoS = 0;
    const will = { topic: this.buildTopic('online'), payload: encoding.writeBool(false).toString(), retain: false, qos };
    this.client = mqtt.connect(serverUrl, { will });

    this.client.on('connect', () => fireAsync(async () => {
      await this.publish(this.buildTopic('online'), encoding.writeBool(true), true);
      this.onlineChange(true);
    }));

    this.client.on('error', err => {
      console.error('mqtt error', err); // TODO: logging
    });

    this.client.on('disconnect', () => this.onlineChange(false));
  }

  private onlineChange(value: boolean): void {
    if (value === this._online) {
      return;
    }
    this._online = value;
    this.emit('onlineChange', value);
  }

  get online(): boolean {
    return this._online;
  }

  async terminate(): Promise<void> {
    await this.client.publish(this.buildTopic('online'), encoding.writeBool(false));
    await this.client.end();
  }

  public buildTopic(domain: string, ...args: string[]): string {
    const finalArgs = [domain, ...args];
    return `${this.instanceName}/${finalArgs.join('/')}`;
  }

  async publish(topic: string, message: string | Buffer, retain:boolean = false) {
    // TODO mqtt release: remove qos
    await this.client.publish(topic, message, { retain, qos: 0 });
  }

  async subscribe(topic: string | string[]) {
    await this.client.subscribe(topic);
  }

  async unsubscribe(topic: string | string[]) {
    await this.client.unsubscribe(topic);
  }
}

/*
const client = mqtt.connect('mqtt://localhost');

client.on('connect', () => {
  let status = false;
  setInterval(() => {
    status = !status;
    client.publish('test/status', encoding.writeBool(status), {
      retain: true,
      qos: 0
    });
  }, 1000);

  client.subscribe('#');

  client.on('message', (topic, message) => {
    console.log(topic, encoding.readBool(message));
  });
});
*/
