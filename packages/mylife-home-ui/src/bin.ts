import 'source-map-support/register';
import { tools } from 'mylife-home-common';
import { Manager } from './manager';

tools.init('ui');

const manager = new Manager();

init();

process.on('SIGINT', terminate);
process.on('SIGTERM', terminate);

async function init() {
  try {
    await manager.init();
  } catch(err) {
    console.error('init error', err);
  }
}

async function terminate() {
  try {
    await manager.terminate();
  } catch(err) {
    console.error('terminate error', err);
  }
}
