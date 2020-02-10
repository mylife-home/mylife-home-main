import mqtt from 'mqtt';
import * as encoding from './encoding';

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
