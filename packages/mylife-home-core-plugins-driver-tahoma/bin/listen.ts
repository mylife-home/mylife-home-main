import { tools, logger } from 'mylife-home-common';
import { Client } from '../src/engine/client';

tools.injectConfig({ logging: { console: true } });
logger.readConfig();

const [, , user, password] = process.argv;

const client = new Client({ user, password });

client.on('onlineChanged', online => console.log('online', online));

client.on('deviceList', devices => {
  for (const device of devices) {
    console.log(device.deviceURL, device.states, '(initial)');
  }
});

client.on('stateRefresh', (deviceURL, states) => {
  console.log(deviceURL, states);
});