import { tools, logger } from 'mylife-home-common';
import { Engine } from '../src/engine/engine';
import { Store } from '../src/engine/store';

tools.injectConfig({ logging: { console: true } });
logger.readConfig();

const store = new Store();

const engine = new Engine(store, {
  user: process.argv[2],
  password: process.argv[3],
  host: 'imap.gmail.com',
  port: 993,
  secure: true
});

store.on('changed', (label: string, active: boolean) => console.log('change', label, active));
store.on('onlineChanged', (online: boolean) => console.log('onlineChanged', online));
