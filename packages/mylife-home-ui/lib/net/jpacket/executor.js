'use strict';

const log4js  = require('log4js');
const Manager = require('./manager');
const Factory = require('./factory');
const logger  = log4js.getLogger('net.jpacket.Executor');

module.exports = class extends Manager {
  constructor(client) {
    super(client);
    this._handlers = new Map();
  }

  on(type, handler) {
    this._handlers.set(type, handler);
  }

  packetReady(from, req) {
    const id = req.id;
    const type = req.type;
    if(!id) { return logger.error('JPacket request without id, dropping'); }
    if(!type) { return this.replyError(from, id, 'Missing type'); }
    const handler = this._handlers.get(type);
    if(!handler) { return this.replyError(from, id, 'Type not handled: ' + type); }
    const send = this.packetSend.bind(this, from);
    return handler(req, (err, res) => {
      if(err) { return this.replyError(from, id, err.toString()); }

      res.id = id;
      send(res);
    });
  }

  replyError(to, id, reason) {
    const res = Factory.createError(reason);
    res.id = id;
    this.packetSend(to, res);
  }
};
