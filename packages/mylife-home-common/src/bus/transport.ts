import { EventEmitter } from 'events';
import * as mqtt from 'async-mqtt';
import * as encoding from './encoding';
import { fireAsync } from '../tools';

export declare interface Transport {
  on(event: 'status', cb: Function): this;
  once(event: 'status', cb: Function): this;
}

export class Transport extends EventEmitter {
  private readonly client: mqtt.AsyncClient;

  constructor(private readonly instanceName: string, serverUrl: string) {
    super();

    // TODO mqtt release: remove toString(), qos
    const qos: mqtt.QoS = 0;
    const will = { topic: this.buildTopic('online'), payload: encoding.writeBool(false).toString(), retain: false, qos };
    this.client = mqtt.connect(serverUrl, { will });

    this.client.on('connect', () => fireAsync(async () => {
      await this.client.publish(this.buildTopic('online'), encoding.writeBool(true), { retain: true, qos: 0 }); // TODO mqtt release: remove qos
    }));

    this.client.on('error', err => {
      console.error('mqtt error', err); // TODO: logging
    });
  }

  async terminate(): Promise<void> {
    await this.client.publish(this.buildTopic('online'), encoding.writeBool(false));
    await this.client.end();
  }

  private buildTopic(domain: string, ...args: string[]): string {
    const finalArgs = [domain, ...args];
    return `${this.instanceName}/${finalArgs.join('/')}`;
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
