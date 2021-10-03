'use strict';

import os from 'os';
import { EventEmitter } from 'events';
import { Client as IrcClient } from 'irc';
import { logger } from 'mylife-home-common';

const log = logger.createLogger('mylife:home:core:plugins:driver-arduino-irc:engine:client');

export declare interface Client extends EventEmitter {
  on(event: 'online', listener: (value: boolean) => void): this;
  off(event: 'online', listener: (value: boolean) => void): this;
  once(event: 'online', listener: (value: boolean) => void): this;

  on(event: 'message', listener: (from: string, text: string) => void): this;
  off(event: 'message', listener: (from: string, text: string) => void): this;
  once(event: 'message', listener: (from: string, text: string) => void): this;

  on(event: 'clear', listener: () => void): this;
  off(event: 'clear', listener: () => void): this;
  once(event: 'clear', listener: () => void): this;

  on(event: 'add', listener: (nick: string) => void): this;
  off(event: 'add', listener: (nick: string) => void): this;
  once(event: 'add', listener: (nick: string) => void): this;

  on(event: 'remove', listener: (nick: string) => void): this;
  off(event: 'remove', listener: (nick: string) => void): this;
  once(event: 'remove', listener: (nick: string) => void): this;
}

export class Client extends EventEmitter {
  private readonly channel: string;
  private readonly irc: IrcClient;
  private readonly nicks = new Set<string>();

  constructor(host: string, channel: string) {
    super();
    this.setMaxListeners(Infinity); // each driver adds listener

    this.channel = channel;
    const nick = `agent-${os.hostname()}-${Date.now()}`;

    const opt = {
      server: host,
      autoRejoign: true,
      channels: [channel],
      nick: nick,
      userName: nick,
      realName: 'Mylife Home Core plugin: Driver Arduino IRC',
      millisecondsOfSilenceBeforePingSent: 60 * 1000,
      millisecondsBeforePingTimeout: 180 * 1000,
      //debug: true
    };

    this.irc = new IrcClient(null, null, opt);

    this.irc.on('error', (message) => log.error(`IRC error: '${message}'`));
    this.irc.on('netError', (error) => log.error(error, 'Network error'));

    this.irc.conn.on('close', this.onClose);
    this.irc.on('registered', this.onRegistered);
    this.irc.on('message', this.onMessage);
    this.irc.on('names', this.onNames);
    this.irc.on('join', this.onJoin);
    this.irc.on('nick', this.onNick);
    this.irc.on('part', this.onPart);
    this.irc.on('kick', this.onKick);
    this.irc.on('kill', this.onKill);
    this.irc.on('quit', this.onQuit);
  }

  destroy() {
    this.clear();
    this.emit('online', false);
    this.irc.disconnect('Closing', null);
  }

  private readonly onClose = () => {
    this.clear();
    this.emit('online', false);
  };

  private readonly onRegistered = () => {
    this.emit('online', true);
  };

  private readonly onMessage = (from: string, to: string, text: string) => {
    if (to.toUpperCase() === this.channel.toUpperCase()) {
      this.emit('message', from, text);
    }
  };

  private readonly onNames = (channel: string, users: { [nick: string]: string }) => {
    if (channel === this.channel) {
      this.reset(Object.keys(users));
    }
  };

  private readonly onJoin = (channel: string, nick: string) => {
    if (channel == this.channel) {
      this.add(nick);
    }
  };

  private readonly onNick = (oldNick: string, newNick: string) => {
    if (oldNick !== this.irc.nick && newNick !== this.irc.nick) {
      this.remove(oldNick);
      this.add(newNick);
    }
  };

  private reset(nicks: string[]) {
    this.clear();
    for (let nick of nicks) {
      if (nick !== this.irc.nick) {
        this.add(nick);
      }
    }
  }

  private readonly onPart = (channel: string, nick: string) => {
    if (channel == this.channel) {
      this.remove(nick);
    }
  };

  private readonly onKick = (channel: string, nick: string) => {
    if (channel == this.channel) {
      this.remove(nick);
    }
  };

  private readonly onKill = (nick: string) => {
    this.remove(nick);
  };

  private readonly onQuit = (nick: string) => {
    this.remove(nick);
  };

  private clear() {
    this.nicks.clear();
    this.emit('clear');
  }

  private add(nick: string) {
    this.nicks.add(nick);
    this.emit('add', nick);
  }

  private remove(nick: string) {
    this.nicks.delete(nick);
    this.emit('remove', nick);
  }

  send(text: string) {
    if (!this.irc.nick) {
      // not connected/not registered
      return;
    }

    this.irc.say(this.channel, text);
  }
}
