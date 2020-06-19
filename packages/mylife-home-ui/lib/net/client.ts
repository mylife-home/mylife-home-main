'use strict';

const EventEmitter = require('events');
const irc = require('irc');
const log4js = require('log4js');
const logger = log4js.getLogger('net.Client');

export default class Client extends EventEmitter {
  constructor(netConfig: { host: string; port: string; }, nick: string) {
    super();

    this.netConfig = netConfig;
    this.channels = ['#mylife-ui'];
    this.defaultChannel = '#mylife-ui';
    this.currentNick = nick;
    this.connecting = true;

    const opt = {
      server: netConfig.host,
      port: netConfig.port,
      autoRejoign: true,
      channels: this.channels,
      nick: nick,
      userName: nick,
      realName: 'Mylife Home',
      millisecondsOfSilenceBeforePingSent: 60 * 1000,
      millisecondsBeforePingTimeout: 180 * 1000,
      //debug: true
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
    this.irc.say(this.defaultChannel, text);
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
