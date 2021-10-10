import { EventEmitter } from 'events';
import { logger } from 'mylife-home-common';

const log = logger.createLogger('mylife:home:core:plugins:driver-lirc:engine:controller');

const SOCKET_PATH = '/var/run/lirc/lircd';

export interface Controller {
  on(event: 'online', listener: (online: boolean) => void): this;
  off(event: 'online', listener: (online: boolean) => void): this;
  once(event: 'online', listener: (online: boolean) => void): this;

  on(event: 'receive', listener: (remote: string, button: string, repeat: number) => void): this;
  off(event: 'receive', listener: (remote: string, button: string, repeat: number) => void): this;
  once(event: 'receive', listener: (remote: string, button: string, repeat: number) => void): this;

  send(remote: string, button: string): void;
}

class ControllerImpl extends EventEmitter implements Controller {
  constructor() {
    super();
    this.setMaxListeners(Infinity); // each device adds listener

    log.info(`LIRC connecting to : '${SOCKET_PATH}'`);
    this.controller = new Lirc(this.config);

    this.controller.on('connect',    this._connect.bind(this));
    this.controller.on('disconnect', this._disconnect.bind(this));
    this.controller.on('error',      this._error.bind(this));
    this.controller.on('receive',    this._receive.bind(this));

    this.connected      = false;
    this.sendQueue      = [];
    this.sending        = false;
    this.receiving      = false;
    this.receiveTimeout = null;
    this.closing        = false;
  }

  ref() {
    ++this.usage;
  }

  unref() {
    return !!(--this.usage);
  }

  close() {
    this.controller.close();
    this.closing = true;
    this.receiveTimeout && clearTimeout(this.receiveTimeout);
    this.receiveTimeout = null;
  }

  send(remote, button) {
    logger.info(`${this.key}: sending: SEND_ONCE remote='${remote}', button='${button}'`);
    this.sendQueue.push({ remote, button });
    this._processSendQueue();
  }

  _receive(remote, button, repeat) {
    logger.info(`${this.key}: received: remote='${remote}', button='${button}', repeat='${repeat}'`);
    repeat = parseInt(repeat, 16);
    this.emit('receive', remote, button, repeat);

    this.receiving = true;
    this.receiveTimeout && clearTimeout(this.receiveTimeout);
    this.receiveTimeout = setTimeout(() => {
      this.receiving = false;
      this._processSendQueue();
    }, 300); // block send for 300 ms when receiving (prevent to send while repeating)
  }

  _changeOnline(value) {
    this.connected = value;
    this.emit('online', value);

    if(value) {
      this._processSendQueue();
      return;
    }

    this.sending = false;
    this.receiving = false;
    this.receiveTimeout && clearTimeout(this.receiveTimeout);
    this.receiveTimeout = null;
  }

  _connect() {
    logger.info(`${this.key}: lirc connected`);
    this._changeOnline(true);
  }

  _disconnect() {
    logger.info(`${this.key}: lirc disconnected`);
    this._changeOnline(false);
  }

  _error(reason) {
    logger.info(`${this.key}: lirc error: ${reason}`);
    switch(reason) {
      case 'end':
      case 'timeout':
        this._changeOnline(false);
        break;
    }
  }

  _processSendQueue() {

    if(!this.connected || this.closing || this.sending || this.receiving || !this.sendQueue.length) {
      return;
    }

    const data = this.sendQueue.shift();

    this.controller.cmd('SEND_ONCE', data.remote, data.button, (err) => {
      this.sending = false;

      if(err) {
        logger.error(`${this.key}: error sending to lirc: ${err}`);
      }

      this._processSendQueue();
    });
    this.sending = true;
  }
}

let controller: ControllerImpl;
let refCount: number = 0;

export function open(): Controller {
  if(!controller) {
    controller = new ControllerImpl();
  }

  ++refCount;
  return controller;
}

export function close(controller: Controller) {
  --refCount;
  if(refCount === 0) {
    controller.close();
  }
}