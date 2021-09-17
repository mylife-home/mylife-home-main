import { Connection } from '../src/engine/connection';
import { tools, logger } from 'mylife-home-common';


tools.injectConfig({ logging: { console: true } });
logger.readConfig();

const con = new Connection({
  user: process.argv[2],
  password: process.argv[3],
  host: 'imap.gmail.com',
  port: 993,
  secure: true
});

con.on('connected', () => console.log('connected'));
con.on('disconnected', () => console.log('disconnected'));
con.on('updated', () => console.log('updated'));

con.on('connected', async () => {
  try {
    const [msg] = await con.fetch(('10'));
    console.log(msg);
    console.log(msg.body.content)
  } catch (err) {
    console.error(err);
  }
});