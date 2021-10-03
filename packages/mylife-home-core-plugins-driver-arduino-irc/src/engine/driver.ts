'use strict';

const EventEmitter = require('events');
const log4js       = require('log4js');
const logger       = log4js.getLogger('core-plugins-hw-arduino-home.Driver');
const Repository   = require('./repository');

class Driver extends EventEmitter {
  constructor(key, nick, service) {
    super();

    this.key     = key;
    this.nick    = nick;
    this.service = service;

    this._repositoryCallback = (evt) => {
      if(evt.key !== this.key) { return; }
      this._refreshClient();
    }

    this._clearCallback   = () => this.emit('online', false);
    this._removeCallback  = (nick) => (this._isMyNick(nick) && this.emit('online', false));
    this._addCallback     = (nick) => (this._isMyNick(nick) && this.emit('online', true));

    this._messageCallback = (from, message) => {
      if(!this._isMyNick(from)) { return; }
      const split = message.split(' ', 2);
      if(!this._isMyService(split[1])) { return; }
      const data = message.substr(split[0].length + split[1].length + 2);
      this.emit('message', split[0], data);
    }

    Repository.on('changed', this._repositoryCallback);

    this._refreshClient();
  }

  _isMyNick(nick) {
    return nick.toUpperCase() === this.nick.toUpperCase();
  }

  _isMyService(service) {
    return service === this.service;
  }

  write(data) {
    if(!this.client) { return; }
    this.client.send(`${this.nick} ${this.service} ${JSON.stringify(data)}`);
  }

  query() {
    if(!this.client) { return; }
    this.client.send(`${this.nick} ${this.service}`);
  }

  close() {
    this._releaseClient(true);
    Repository.removeListener('changed', this._repositoryCallback);
  }

  _refreshClient() {
    const client = Repository.get(this.key);
    if(!client) {
      this._releaseClient();
      return;
    }

    if(this.client) { return; }

    this.client = client;
    this.client.on('clear', this._clearCallback);
    this.client.on('remove', this._removeCallback);
    this.client.on('add', this._addCallback);
    this.client.on('message', this._messageCallback);
    
    this.client.nicks.forEach(this._addCallback);
  }

  _releaseClient(closing = false) {

    if(!closing) {
      this.emit('online', false);
    }

    if(!this.client) { return; }

    this.client.removeListener('clear', this._clearCallback);
    this.client.removeListener('remove', this._removeCallback);
    this.client.removeListener('add', this._addCallback);
    this.client.removeListener('message', this._messageCallback);

    this.client = null;
  }
}

module.exports = Driver;