import { tools, logger } from 'mylife-home-common';
import { API } from '../src/engine/api';

tools.injectConfig({ logging: { console: true } });
logger.readConfig();

const [, , username, password] = process.argv;

async function main() {
  try {
    const api = new API(username, password);
    await api.login();

    for (const device of await api.getDevices()) {
      console.log(`'${device.label}' => deviceURL=${device.deviceURL}, definition.qualifiedName=${device.definition.qualifiedName}`);
    }
  } catch (err) {
    console.error(err);
  }
}

main();