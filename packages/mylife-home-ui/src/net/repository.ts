import { EventEmitter } from 'events';
import log4js from 'log4js';
import RemoteObject from './remote-object';
import Client from './client';

const logger = log4js.getLogger('net.repository');

export default class Repository extends EventEmitter {
  private readonly _objects = new Map<string, RemoteObject>();

  constructor(private readonly client: Client) {
    super();

    this.client.irc.on('names', (c, u) => { if (c !== '#mylife-ui') { return; } this._reset(Object.keys(u)); });
    this.client.irc.on('join', (c, n) => { if (c !== '#mylife-ui') { return; } this._add(n); });
    this.client.irc.on('nick', this._change.bind(this));
    this.client.irc.on('part', (c, n) => { if (c !== '#mylife-ui') { return; } this._remove(n); });
    this.client.irc.on('kick', (c, n) => { if (c !== '#mylife-ui') { return; } this._remove(n); });
    this.client.irc.on('kill', this._remove.bind(this));
    this.client.irc.on('quit', this._remove.bind(this));
  }

  _reset(nicks: string[]) {
    this._clear();
    for (const nick of nicks) {
      if (nick === this.client.irc.nick) { continue; }
      this._add(nick);
    }
  }

  _clear() {
    this._objects.clear();
    this.emit('clear');
  }

  _add(nick: string) {
    const obj = new RemoteObject(nick, this);
    this._objects.set(obj.id, obj);
    this.emit('add', obj.id, obj);
  }

  _remove(nick: string) {
    const id = RemoteObject.getIdFromNick(nick);
    this._objects.delete(id);
    this.emit('remove', id);
  }

  _change(oldNick: string, newNick: string) {
    if (oldNick === this.client.irc.nick) { return; }
    if (newNick === this.client.irc.nick) { return; }

    const id = RemoteObject.getIdFromNick(oldNick);
    const obj = this._objects.get(id);
    if (!obj) {
      logger.error('remote object not found for id: ' + id);
      return;
    }

    if (obj.change(newNick)) { return; }

    // change failed -> remove/add
    this._remove(oldNick);
    this._add(newNick);
  }

  get objects() {
    const keys = [];
    for (const key of this._objects.keys()) {
      keys.push(key);
    }
    return keys;
  }

  object(id: string) {
    return this._objects.get(id);
  }

  action(id: string, name: string, args: string[]) {
    this.client.action(id, name, args);
  }
};
