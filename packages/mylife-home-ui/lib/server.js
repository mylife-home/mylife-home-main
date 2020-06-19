'use strict';

const EventEmitter = require('events');
const os           = require('os');
const async        = require('async');
const net          = require('./net');
const admin          = require('./admin');
const web          = require('./web');

class Session extends EventEmitter {
  constructor(id, socket, netConfig, webConfig, netRepository) {
    super();

    this._headerIp        = webConfig.headerIp;
    this._terminating     = false;
    this._socketConnected = true;
    this._id              = id;
    this._socket          = socket;
    this._net             = new net.Client(netConfig, this._createNick());
    this._netRepository   = netRepository;
    const self            = this;

    this._socket.on('disconnect', () => self._net.close(() => self.emit('close')));
    this._socket.on('action', (data) => this._net.action(data.id, data.name, data.args));

    this._netRepository.on('add', (id, obj) => self._socket.emit('add', { id: id, attributes: self._objAttributes(obj) }));
    this._netRepository.on('remove', (id) => self._socket.emit('remove', { id: id }));
    this._netRepository.on('change', (id, name, value) => self._socket.emit('change', { id: id, name: name, value: value }));

    this._sendState();
  }

  _createNick() {
    return 'ui-session_' + this._id + '_' +
      this.remoteAddress.replace(/\./g, '-').replace(/:/g, '-');
  }

  _objAttributes(obj) {
    const attrs = {};
    for(let name of obj.attributes) {
      attrs[name] = obj.attribute(name);
    }
    return attrs;
  }

  _sendState() {
    const data = {};
    for(let id of this._netRepository.objects) {
      const obj = this._netRepository.object(id);
      data[id] = this._objAttributes(obj);
    }
    this._socket.emit('state', data);
  }

  get id() {
    return this._id;
  }

  get remoteAddress() {
    const header = this._socket.request.headers[this._headerIp];
    if(header) { return header; }
    return this._socket.request.connection.remoteAddress;
  }

  kill(cb) {
    this.once('close', cb);
    this._socket.disconnect();
  }
}

module.exports = class {
  constructor(config, dev) {
    const netConfig        = this._netConfig = config.net;
    const webConfig        = this._webConfig = config.web;
    this._netAgent         = new net.Client(netConfig, 'ui-agent');
    this._netRepository    = new net.Repository(this._netAgent);
    this._webServer        = new web.Server(this._netRepository, this._createSession.bind(this), webConfig, dev);
    this._sessions         = new Map();
    this._idGenerator      = 0;
  }

  _createSession(socket) {
    const self = this;
    const id = (++this._idGenerator).toString();
    const session = new Session(id, socket, this._netConfig, this._webConfig, this._netRepository);
    this._sessions.set(id, session);
    session.on('close', () => self._sessions.delete(id));
  }

  _closeSession(session) {
    return (cb) => session.kill(cb);
  }

  close(cb) {
    const array = [
      (cb) => this._webServer.close(cb),
      (cb) => this._netAgent.close(cb)
    ];
    for(let session of this._sessions.values()) {
      array.push(this._closeSession(session));
    }

    async.parallel(array, cb);
  }
};