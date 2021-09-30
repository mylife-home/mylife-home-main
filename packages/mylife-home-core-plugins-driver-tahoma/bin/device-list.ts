import { tools, logger } from 'mylife-home-common';
import { Connection } from '../src/engine/connection';

tools.injectConfig({ logging: { console: true } });
logger.readConfig();

const [, , username, password] = process.argv;

async function main() {
  try {
    const con = new Connection(username, password);
    await con.login();
  } catch (err) {
    console.error(err);
  }
}

main();