'use strict';

const EventEmitter = require('events');
const async = require('async');
const net = require('./net');
const web = require('./web');

class Session extends EventEmitter {
  constructor(socket, netRepository) {
    super();

    this._terminating = false;
    this._socketConnected = true;
    this._socket = socket;
    this._netRepository = netRepository;
    const self = this;

    this._socket.on('disconnect', () => self._net.close(() => self.emit('close')));
    this._socket.on('action', (data) => this._netRepository.action(data.id, data.name, data.args));

    this._netRepository.on('add', (id, obj) => self._socket.emit('add', { id: id, attributes: self._objAttributes(obj) }));
    this._netRepository.on('remove', (id) => self._socket.emit('remove', { id: id }));
    this._netRepository.on('change', (id, name, value) => self._socket.emit('change', { id: id, name: name, value: value }));

    this._sendState();
  }

  _objAttributes(obj) {
    const attrs = {};
    for (const name of obj.attributes) {
      attrs[name] = obj.attribute(name);
    }
    return attrs;
  }

  _sendState() {
    const data = {};
    for (const id of this._netRepository.objects) {
      const obj = this._netRepository.object(id);
      data[id] = this._objAttributes(obj);
    }
    this._socket.emit('state', data);
  }

  kill(cb) {
    this.once('close', cb);
    this._socket.disconnect();
  }
}

module.exports = class {
  constructor(config, dev) {
    const netConfig = (this._netConfig = config.net);
    const webConfig = (this._webConfig = config.web);
    this._netAgent = new net.Client(netConfig, 'ui-agent');
    this._netRepository = new net.Repository(this._netAgent);
    this._webServer = new web.Server(this._netRepository, this._createSession.bind(this), webConfig, dev);
    this._sessions = new Map();
    this._idGenerator = 0;
  }

  _createSession(socket) {
    const self = this;
    const id = (++this._idGenerator).toString();
    const session = new Session(socket, this._netRepository);
    this._sessions.set(id, session);
    session.on('close', () => self._sessions.delete(id));
  }

  _closeSession(session) {
    return (cb) => session.kill(cb);
  }

  close(cb) {
    const array = [(cb) => this._webServer.close(cb), (cb) => this._netAgent.close(cb)];
    for (const session of this._sessions.values()) {
      array.push(this._closeSession(session));
    }

    async.parallel(array, cb);
  }
};
