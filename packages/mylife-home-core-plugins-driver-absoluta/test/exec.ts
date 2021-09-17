import { tools, logger } from 'mylife-home-common';
import { Connection } from '../src/engine/connection';
import { parse } from '../src/engine/parser';

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
    const since = new Date();
    since.setDate(since.getDate() - 3);

    for await (const msg of con.fetch({ since })) {
      //console.log(msg.seq);
      //last = msg;
      const updates = parse(msg);
    }

  } catch (err) {
    console.error(err);
  }
});