import { tools, logger } from 'mylife-home-common';
import { API } from '../src/engine/api';

tools.injectConfig({ logging: { console: true } });
logger.readConfig();

const [, , username, password] = process.argv;

async function main() {
  try {
    const api = new API(username, password);
    await api.login();
    console.log(await api.getDevices());
  } catch (err) {
    console.error(err);
  }
}

main();