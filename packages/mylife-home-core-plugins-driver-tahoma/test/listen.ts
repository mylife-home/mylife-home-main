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

    const listenerId = await api.registerEvents();
    await api.refreshStates();
    console.log(await api.execute({ actions: [{ deviceURL: 'io://0220-6975-2311/4185789', commands: [{ name: 'open' }] }]}));

    while (true) {
      console.dir(await api.fetchEvents(listenerId), { depth: null });
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
} catch (err) {
  console.error(err);
}
}

main();

