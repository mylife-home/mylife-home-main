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
    this._netJpacketClient = new net.jpacket.Client(this._netAgent);
    this._adminClient      = new admin.Client(netConfig, this._adminNick(), this._createAdminDefinition());
    this._adminExecutor    = new net.jpacket.Executor(this._adminClient);
    this._webServer        = new web.Server(this._netRepository, this._netJpacketClient,  this._createSession.bind(this), webConfig, dev);
    this._sessions         = new Map();
    this._idGenerator      = 0;

    this._adminExecutor.on('session_list', this._executeSessionList.bind(this));
    this._adminExecutor.on('session_kill', this._executeSessionKill.bind(this));
    this._adminExecutor.on('sysinfo',      this._executeSysInfo.bind(this));
  }

  _adminNick() {
    return 'mylife-home-ui_' + os.hostname().split('.')[0];
  }

  _createAdminDefinition() {
    const self = this;
    return {
      session: {
        desc: 'Session management',
        children: {
          list: {
            desc: 'List current sessions',
            impl: (w) => {
              w('Session list:');
              for(let session of self._sessions.values()) {
                w('ID: ' + session.id + ', Remote address: ' + session.remoteAddress);
              }
              w('---');
            }
          },
          kill: {
            desc: 'Kill a session by id',
            impl: (w, m) => {
              if(!m || m === '') { return w('No session provided'); }
              const session = self._sessions.get(m);
              if(!session) { return w('Session not found: ' + m); }
              session.kill(() => w('Session ' + m + ' killed'));
            }
          }
        }
      },
      system: admin.SysInfo.definition
    };
  }

  _executeSessionList(req, cb) {
    const factory = net.jpacket.Factory;
    const list = [];
    for(let session of this._sessions.values()) {
      list.push({ id: session.id, remoteAddress: session.remoteAddress });
    }
    return setImmediate(cb, undefined, factory.createSessionList(list));
  }

  _executeSessionKill(req, cb) {
    const factory = net.jpacket.Factory;
    const session = this._sessions.get(req.sessionId);
    if(!session) { return setImmediate(cb, new Error('Session not found: ' + req.sessionId)); }
    session.kill(() => setImmediate(cb, undefined, factory.createSuccess()));
  }

  _executeSysInfo(req, cb) {
    const factory = net.jpacket.Factory;
    admin.SysInfo.getInfo((err, res) => {
      if(err) { return cb(err); }
      setImmediate(cb, undefined, factory.createSysInfo(res));
    });
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
      (cb) => this._netAgent.close(cb),
      (cb) => this._adminClient.close(cb)
    ];
    for(let session of this._sessions.values()) {
      array.push(this._closeSession(session));
    }

    async.parallel(array, cb);
  }
};