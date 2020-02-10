import mqtt from 'async-mqtt';
import * as encoding from './encoding';

export class Transport {
  client: mqtt.AsyncClient;
  instanceName: string;

  constructor(instanceName: string, serverUrl: string) {
    this.instanceName = instanceName;
    this.client = mqtt.connect(serverUrl, {
      // will: { topic: this.buildTopic('online'), payload: encoding.writeBool(false), retain: false } TODO: bad payload type
    });

    this.client.on('connect', () => {
      // TODO async
      this.client.publish(this.buildTopic('online'), encoding.writeBool(true), { retain: true });
    });
  }

  async terminate(): Promise<void> {
    await this.client.publish(this.buildTopic('online'), encoding.writeBool(false));
    await this.client.end();
  }

  buildTopic(domain: string, ...args: string[]): string {
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
