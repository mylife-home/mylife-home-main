import { EventEmitter } from 'events';
import log4js from 'log4js';

const logger = log4js.getLogger('net.remoteObject');

export default class RemoteObject {
  private readonly _emitter: EventEmitter;
  private readonly _id: string;
  private readonly _attributes: { [name: string]: string; };

  constructor(nick: string, emitter: EventEmitter) {
    const data = RemoteObject._parseNick(nick);
    this._emitter = emitter;
    this._id = data.id;
    this._attributes = data.attributes;
  }

  static getIdFromNick(nick: string) {
    return RemoteObject._parseNick(nick).id;
  }

  private static _parseNick(nick: string) {
    const [ id, ...parts] = nick.split('|');
    const attributes: { [name: string]: string; } = {};
    for (const part of parts) {
      const items = part.split('`');
      attributes[items[0]] = items[1];
    }
    return { id, attributes };
  }

  change(newNick: string) {
    const data = RemoteObject._parseNick(newNick);
    if (data.id !== this._id) {
      logger.error('object \'' + this._id + '\' has changed id to \'' + data.id + '\'');
      return false;
    }

    for (let name of Object.keys(this._attributes)) {
      const oldValue = this._attributes[name];
      const newValue = data.attributes[name];
      if (newValue === undefined) {
        logger.error('object \'' + this._id + '\' has lost attribute \'' + name + '\', ignoring (but this leads to sync problems)');
        continue;
      }

      if (oldValue !== newValue) {
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

  attribute(name: string) {
    return this._attributes[name];
  }
};
