'use strict';


const log4js  = require('log4js');
const Manager = require('./manager');
const Factory = require('./factory');
const logger  = log4js.getLogger('net.jpacket.Client');

class PendingExecute {
  constructor(id, cb, terminatedCb) {
    this._id           = id;
    this._cb           = cb;
    this._terminatedCb = terminatedCb;
    this._resetTimeout();
  }

  data(res) {
    setImmediate(this._cb, undefined, res);
    this._end();
  }

  _resetTimeout() {
    if(this._timeout) { clearTimeout(this._timeout); }
    this._timeout = setTimeout(this.error.bind(this, 'TIMEOUT'), 30000);
  }

  error(err) {
    setImmediate(this._cb, err);
    this._end();
  }

  _end() {
    clearTimeout(this._timeout);
    this._terminatedCb(this._id);
  }
}

module.exports = class extends Manager {
  constructor(client) {
    super(client);

    this._idGenerator     = 0;
    this._pendingExecutes = new Map();
    this._resourcesNick   = client.netConfig.resources_nick;

    client.irc.on('disconnect', this._onDisconnect.bind(this));

    Factory.extendsClient(this);
  }

  packetReady(from, data) {
    if(!data.id) { return logger.error(data); }
    const pending = this._pendingExecutes.get(data.id);
    if(!pending) { return logger.error(`pending not found ${data.id}`); }
    pending.data(data);
  }

  _executeEnd(id) {
    this._pendingExecutes.delete(id);
  }

  _onDisconnect() {
    while(this._pendingExecutes.length) {
      let key = this._pendingPackets.keys().next().value;
      this._pendingExecutes.get(key).error('DISCONNECTED');
    }
  }

  execute(req, cb, nick) {
    const id   = (++this._idGenerator).toString();
    req.id = id;
    this.packetSend(nick || this._resourcesNick, req);
    this._pendingExecutes.set(id, new PendingExecute(id, cb, this._executeEnd.bind(this)));
  }
};