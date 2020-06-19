import { EventEmitter } from 'events';
import * as irc from 'irc';
import log4js from 'log4js';

const logger = log4js.getLogger('net.Client');

export default class Client extends EventEmitter {
  private connecting: boolean;
  private currentNick: string;
  private irc: irc.Client;

  constructor(netConfig: { host: string; port: number; }, nick: string) {
    super();

    this.currentNick = nick;
    this.connecting = true;

    const opt = {
      server: netConfig.host,
      port: netConfig.port,
      autoRejoign: true,
      channels: ['#mylife-ui'],
      nick: nick,
      userName: nick,
      realName: 'Mylife Home'
    };
    this.irc = new irc.Client(null, null, opt);

    this.irc.on('error', (message: any) => logger.error('IRC error: ' + JSON.stringify(message)));
    this.irc.on('netError', (message: any) => logger.error('Network error: ' + JSON.stringify(message)));

    this.irc.conn.on('close', () => { this.connecting = true; });
    // in case the nick changed while registration, we need to send it back after whois (not in this loop)
    this.irc.on('registered', () => setImmediate(() => { this.connecting = false; this.nick(this.currentNick); }));
  }

  close(callback: (err?: Error) => void) {
    this.irc.disconnect('Closing', callback);
    this.irc = null;
  }

  action(id: string, name: string, args: string[]) {
    args = args || [];
    this.say(id + ' ' + name + ' ' + args.join(' '));
  }

  say(text: string) {
    if (!this.irc) { return; }

    if (!this.irc.nick) { return; } // not connected/not registered
    this.irc.say('#mylife-ui', text);
  }

  nick(nick: string) {
    if (!this.irc) { return; }

    this.currentNick = nick;
    // forbid nick change while connecting or we can reach races conditions
    if (this.connecting) { return; }
    // send nick changes at the end on the loop (avoid nick flood)
    this.irc.send('NICK', this.currentNick);
  }
};
