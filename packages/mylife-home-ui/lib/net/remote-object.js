'use strict';

const log4js       = require('log4js');
const logger       = log4js.getLogger('net.remoteObject');

module.exports = class RemoteObject {
  constructor(nick, emitter) {
    const data       = RemoteObject._parseNick(nick);
    this._emitter    = emitter;
    this._id         = data.id;
    this._attributes = data.attributes;
  }

  static getIdFromNick(nick) {
    return RemoteObject._parseNick(nick).id;
  }

  static _parseNick(nick) {
    const parts = nick.split('|');
    const ret = {
      id         : parts[0],
      attributes : {}
    };
    parts.shift();
    for(let part of parts) {
      const items = part.split('`');
      ret.attributes[items[0]] = items[1];
    }
    return ret;
  }

  change(newNick) {
    const data = RemoteObject._parseNick(newNick);
    if(data.id !== this._id) {
      logger.error('object \'' + this._id + '\' has changed id to \'' + data.id + '\'');
      return false;
    }

    for(let name of Object.keys(this._attributes)) {
      const oldValue = this._attributes[name];
      const newValue = data.attributes[name];
      if(newValue === undefined) {
        logger.error('object \'' + this._id + '\' has lost attribute \'' + name + '\', ignoring (but this leads to sync problems)');
        continue;
      }

      if(oldValue !== newValue) {
        this._attributes[name] = newValue;
        this._emitter.emit('change', this._id, name, newValue);
      }
    }

    return true;
  }

  get id() {
    return this._id;
  }

  get attributes() {
    return Object.keys(this._attributes);
  }

  attribute(name) {
    return this._attributes[name];
  }
};
