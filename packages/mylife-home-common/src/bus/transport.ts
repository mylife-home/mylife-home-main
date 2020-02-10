import mqtt from 'mqtt';
import * as encoding from './encoding';

export class Transport {
  client: mqtt.Client;
  instanceName: string;

  constructor(instanceName: string, serverUrl: string) {
    this.instanceName = instanceName;
    this.client = mqtt.connect(serverUrl, {
      // will: { topic: `${instanceName}/online`, payload: encoding.writeBool(false), retain: false } TODO: bad payload type
    });

    this.client.on('connect', () => {
      this.client.publish(`${this.instanceName}/online`, encoding.writeBool(true), { retain: true });
    });
  }

  terminate(): void {
    this.client.publish(`${this.instanceName}/online`, encoding.writeBool(false));
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
