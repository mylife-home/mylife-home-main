'use strict';

// format irc :
// jpacket init <id> <data count>
// jpacket data <id> <data1>
// jpacket data <id> <data2>
// expiration du paquet si au bout de 30 secondes il n'a plus été mis à jour et n'est pas terminé

// max msg : 512 chars. On compte 150 pour nick + command, il reste 362. on prend 300 comme marge (si le nick est plus long plus tard mettons ...)

const log4js       = require('log4js');
const logger       = log4js.getLogger('net.jpacket.Manager');

class PendingPacket {
  constructor(from, id, expectedCount, cb, terminatedCb) {
    this._from         = from;
    this._id           = id;
    this._cb           = cb;
    this._buffer       = '';
    this._total        = expectedCount;
    this._count        = 0;
    this._terminatedCb = terminatedCb;
    this._resetTimeout();
  }

  data(raw) {
    this._resetTimeout();
    this._buffer += raw;
    if(++this._count === this._total) {
      let obj;
      try {
        obj = JSON.parse(this._buffer);
      }
      catch(err) {
        logger.error(this._id, err);
        return this._end();
      }
      this._end();
      return setImmediate(this._cb, this._from, obj.root);
    }
  }

  _resetTimeout() {
    if(this._timeout) { clearTimeout(this._timeout); }
    this._timeout = setTimeout(this._expired.bind(this), 30000);
  }

  _expired() {
    logger.error(this._id, 'timeout');
    this._end();
  }

  _end() {
    clearTimeout(this._timeout);
    this._terminatedCb(this._id);
  }
}

module.exports = class {
  constructor(client) {
    this._irc             = client.irc;
    this._idGenerator     = 0;
    this._pendingPackets  = new Map();

    client.irc.on('disconnect', this._onManagerDisconnect.bind(this));
    client.irc.on('message',    this._onMessage.bind(this));
  }

  packetSend(to, req) {
    const self = this;
    const id   = (++this._idGenerator).toString();

    const data = JSON.stringify({root: req}).match(/.{1,300}/g);
    this._irc.say(to, `jpacket init ${id} ${data.length}`);
    data.forEach((it) => self._irc.say(to, `jpacket data ${id} ${it}`));
  }

  packetReady() {
    logger.warning('packetReady: override needed!');
  }

  _packetEnd(id) {
    this._pendingPackets.delete(id);
  }

  _onManagerDisconnect() {
    this._pendingPackets.clear();
  }

  _onMessage(from, to, text) {
    if(to.startsWith('#')) { return; }

    const arr = text.split(' ');
    if(arr.length < 4) { return; }
    if(arr.shift() !== 'jpacket') { return; }

    const cmd     = arr.shift();
    const id      = arr.shift();
    const payload = arr.join(' ');

    if(cmd === 'init') {
      let pending = new PendingPacket(
        from,
        id,
        parseInt(payload),
        this.packetReady.bind(this),
        this._packetEnd.bind(this));

      this._pendingPackets.set(from + id, pending);
    }
    else if(cmd === 'data') {
      let pending = this._pendingPackets.get(from + id);
      if(!pending) { return; }
      pending.data(payload);
    }
  }
};
