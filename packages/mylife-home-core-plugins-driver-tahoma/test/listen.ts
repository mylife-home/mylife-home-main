import { tools, logger } from 'mylife-home-common';
import { API } from '../src/engine/api';

tools.injectConfig({ logging: { console: true } });
logger.readConfig();

const [, , username, password] = process.argv;

async function main() {
  try {
    const api = new API(username, password);

    for (const device of await api.getDevices()) {
      for (const state of device.states || []) {
        console.log(`${new Date().toISOString()} - label=${device.label}, deviceURL=${device.deviceURL}, name=${state.name}, value=${state.value} (initial)`);
      }
    }

    console.log(await api.registerEvents());
  } catch (err) {
    console.error(err);
  }
}

main();

