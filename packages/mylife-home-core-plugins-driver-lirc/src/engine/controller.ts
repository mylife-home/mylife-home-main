import { EventEmitter } from 'events';
import { logger } from 'mylife-home-common';
import Lirc from 'lirc-client';

const log = logger.createLogger('mylife:home:core:plugins:driver-lirc:engine:controller');

const SOCKET_PATH = '/var/run/lirc/lircd';

export interface Controller extends EventEmitter {
  on(event: 'online', listener: (online: boolean) => void): this;
  off(event: 'online', listener: (online: boolean) => void): this;
  once(event: 'online', listener: (online: boolean) => void): this;

  on(event: 'receive', listener: (remote: string, button: string, repeat: number) => void): this;
  off(event: 'receive', listener: (remote: string, button: string, repeat: number) => void): this;
  once(event: 'receive', listener: (remote: string, button: string, repeat: number) => void): this;

  send(remote: string, button: string): void;
}

interface SendCommand {
  remote: string;
  button: string;
}

class ControllerImpl extends EventEmitter implements Controller {
  private readonly controller: Lirc;
  private connected = false;
  private readonly sendQueue: SendCommand[] = [];
  private sending = false;
  private receiving = false;
  private receiveTimeout: NodeJS.Timeout = null;
  private closing = false;

  constructor() {
    super();
    this.setMaxListeners(Infinity); // each device adds listener

    log.info(`LIRC connecting to '${SOCKET_PATH}'`);
    this.controller = new Lirc({ path: SOCKET_PATH });

    this.controller.on('connect', this.onConnect);
    this.controller.on('disconnect', this.onDisconnect);
    this.controller.on('error', this.onError);
    this.controller.on('receive', this.onReceive);
  }

  close() {
    this.controller.disconnect();
    this.closing = true;

    if (this.receiveTimeout) {
      clearTimeout(this.receiveTimeout);
      this.receiveTimeout = null;
    }
  }

  send(remote: string, button: string) {
    log.info(`Sending: remote='${remote}', button='${button}'`);
    this.sendQueue.push({ remote, button });
    this.processSendQueue();
  }

  private readonly onReceive = (remote: string, button: string, srepeat: string) => {
    log.info(`Received: remote='${remote}', button='${button}', repeat='${srepeat}'`);
    const repeat = parseInt(srepeat, 16);
    this.emit('receive', remote, button, repeat);

    this.receiving = true;

    if (this.receiveTimeout) {
      clearTimeout(this.receiveTimeout);
    }

    this.receiveTimeout = setTimeout(() => {
      this.receiving = false;
      this.processSendQueue();
    }, 300); // block send for 300 ms when receiving (prevent to send while repeating)
  };

  private changeOnline(value: boolean) {
    this.connected = value;
    this.emit('online', value);

    if (value) {
      this.processSendQueue();
      return;
    }

    this.sending = false;
    this.receiving = false;
    this.receiveTimeout && clearTimeout(this.receiveTimeout);
    this.receiveTimeout = null;
  }

  private readonly onConnect = () => {
    log.info('Lirc connected');
    this.changeOnline(true);
  };

  private readonly onDisconnect = () => {
    log.info('Lirc disconnected');
    this.changeOnline(false);
  };

  private onError(reason: string) {
    log.info(`Lirc error: ${reason}`);
    switch (reason) {
      case 'end':
      case 'timeout':
        this.changeOnline(false);
        break;
    }
  }

  private async processSendQueue() {
    while (this.sendQueue.length) {
      if (!this.connected || this.closing || this.sending || this.receiving) {
        return;
      }

      this.sending = true;
      try {
        const data = this.sendQueue.shift();
        await this.controller.sendOnce(data.remote, data.button);
      } catch (err) {
        log.error(err, `Error sending to lirc`);
      } finally {
        this.sending = false;
      }
    }
  }
}

let controllerInstance: ControllerImpl;
let refCount: number = 0;

export function open(): Controller {
  if (!controllerInstance) {
    controllerInstance = new ControllerImpl();
  }

  ++refCount;
  return controllerInstance;
}

export function close(controller: Controller) {
  --refCount;
  if (refCount === 0) {
    controllerInstance.close();
  }
}
