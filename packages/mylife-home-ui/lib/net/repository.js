'use strict';

const EventEmitter = require('events');
const log4js       = require('log4js');
const RemoteObject = require('./remote-object');
const logger       = log4js.getLogger('net.repository');

module.exports = class extends EventEmitter {
  constructor(client) {
    super();

    this._client = client;
    this._irc = client.irc;
    this._objects = new Map();
    this._channel = client.defaultChannel;

    this._irc.on('names',(c, u) => { if(c !== this._channel) { return; } this._reset(Object.keys(u)); });
    this._irc.on('join', (c, n) => { if(c !== this._channel) { return; } this._add(n); });
    this._irc.on('nick', this._change.bind(this));
    this._irc.on('part', (c, n) => { if(c !== this._channel) { return; } this._remove(n); });
    this._irc.on('kick', (c, n) => { if(c !== this._channel) { return; } this._remove(n); });
    this._irc.on('kill', this._remove.bind(this));
    this._irc.on('quit', this._remove.bind(this));
  }

  _reset(nicks) {
    this._clear();
    for(let nick of nicks) {
      if(nick === this._irc.nick) { continue; }
      this._add(nick);
    }
  }

  _clear() {
    this._objects.clear();
    this.emit('clear');
  }

  _add(nick) {
    const obj = new RemoteObject(nick, this);
    this._objects.set(obj.id, obj);
    this.emit('add', obj.id, obj);
  }

  _remove(nick) {
    const id = RemoteObject.getIdFromNick(nick);
    this._objects.delete(id);
    this.emit('remove', id);
  }

  _change(oldNick, newNick) {
    if(oldNick === this._irc.nick) { return; }
    if(newNick === this._irc.nick) { return; }

    const id = RemoteObject.getIdFromNick(oldNick);
    const obj = this._objects.get(id);
    if(!obj) {
      logger.error('remote object not found for id: ' + id);
      return;
    }

    if(obj.change(newNick)) { return; }

    // change failed -> remove/add
    this._remove(oldNick);
    this._add(newNick);
  }

  get objects() {
    const keys = [];
    for(let key of this._objects.keys()) {
      keys.push(key);
    }
    return keys;
  }

  object(id) {
    return this._objects.get(id);
  }

  action(id, name, args) {
    this._client.action(id, name, args);
  }
};
