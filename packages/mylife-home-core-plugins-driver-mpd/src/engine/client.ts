// From: https://github.com/andrewrk/mpd.js/blob/master/index.js

import { EventEmitter } from 'events';
import assert from 'assert';
import net from 'net';

const MPD_SENTINEL = /^(OK|ACK|list_OK)(.*)$/m;
const OK_MPD = /^OK MPD /;

export interface ConnectOptions {
  readonly host: string;
  readonly port: number;
}

export declare interface MpdClient extends EventEmitter {
  on(event: 'connect', listener: () => void): this;
  off(event: 'connect', listener: () => void): this;
  once(event: 'connect', listener: () => void): this;

  on(event: 'close', listener: () => void): this;
  off(event: 'close', listener: () => void): this;
  once(event: 'close', listener: () => void): this;

  on(event: 'error', listener: (err: Error) => void): this;
  off(event: 'error', listener: (err: Error) => void): this;
  once(event: 'error', listener: (err: Error) => void): this;

  on(event: 'ready', listener: () => void): this;
  off(event: 'ready', listener: () => void): this;
  once(event: 'ready', listener: () => void): this;

  on(event: 'system', listener: (name: string) => void): this;
  off(event: 'system', listener: (name: string) => void): this;
  once(event: 'system', listener: (name: string) => void): this;
}

type MessageCallback = (err: Error, msg?: string) => void;

export class MpdClient extends EventEmitter {
  private buffer = '';
  private msgHandlerQueue: MessageCallback[] = [];
  private idling = false;
  private readonly socket: net.Socket;

  constructor(options: ConnectOptions) {
    super();

    this.socket = net.connect(options, () => {
      this.emit('connect');
    });

    this.socket.setEncoding('utf8');

    this.socket.on('data', this.receive);

    this.socket.on('close', function () {
      this.emit('close');
    });

    this.socket.on('error', function (err) {
      this.emit('error', err);
    });
  }

  close() {
    this.socket.destroy();
  }

  private readonly receive = (data: string) => {
    this.buffer += data;

    let match: RegExpMatchArray;
    while (match = this.buffer.match(MPD_SENTINEL)) {
      const msg = this.buffer.substring(0, match.index);
      const [line, code, str] = match;
      if (code === 'ACK') {
        const err = new Error(str);
        this.handleMessage(err);
      } else if (OK_MPD.test(line)) {
        this.setupIdling();
      } else {
        this.handleMessage(null, msg);
      }

      this.buffer = this.buffer.substring(msg.length + line.length + 1);
    }
  };

  private setupIdling() {
    this.sendWithCallback('idle', (err, msg) => {
      this.handleIdleResultsLoop(err, msg);
    });
    this.idling = true;
    this.emit('ready');
  };

  private handleMessage(err: Error, msg?: string) {
    const handler = this.msgHandlerQueue.shift();
    handler(err, msg);
  };

  sendCommand(cmd: string, args: string[], callback: MessageCallback) {
    assert.ok(this.idling);
    const command = cmd + ' ' + args.map(argEscape).join(' ');

    this.send('noidle\n');
    this.sendWithCallback(command, callback);
    this.sendWithCallback('idle', this.handleIdleResultsLoop);
  }

  private sendWithCallback(command: string, callback: MessageCallback) {
    this.msgHandlerQueue.push(callback);
    this.send(command + '\n');
  }

  private send(data: string) {
    this.socket.write(data);
  }

  private readonly handleIdleResultsLoop = (err: Error, msg: string) => {
    if (err) {
      this.emit('error', err);
      return;
    }

    this.handleIdleResults(msg);
    if (this.msgHandlerQueue.length === 0) {
      this.sendWithCallback('idle', this.handleIdleResultsLoop);
    }
  };

  private handleIdleResults(msg: string) {
    for (const system of msg.split('\n')) {
      if (system) {
        const name = system.substring(9);
        this.emit('system', name);
      }
    }
  }
}

function argEscape(arg: string) {
  // replace all " with \"
  return '"' + arg.toString().replace(/"/g, '\\"') + '"';
}

// convenience
export function parseKeyValueMessage(msg: string) {
  const result: { [key: string]: string; } = {};

  for (const part of msg.split('\n')) {
    if (!part) {
      continue;
    }

    const keyValue = part.match(/([^ ]+): (.*)/);
    if (keyValue == null) {
      throw new Error(`Could not parse entry '${part}'`);
    }

    result[keyValue[1]] = keyValue[2];
  }

  return result;
}

export function parseArrayMessage(msg: string) {
  const results = [];
  let obj: { [key: string]: string; } = {};

  for (const part of msg.split('\n')) {
    if (!part) {
      continue;
    }

    const keyValue = part.match(/([^ ]+): (.*)/);
    if (keyValue == null) {
      throw new Error(`Could not parse entry '${part}'`);
    }

    if (obj[keyValue[1]] !== undefined) {
      results.push(obj);
      obj = {};
      obj[keyValue[1]] = keyValue[2];
    } else {
      obj[keyValue[1]] = keyValue[2];
    }
  }

  results.push(obj);
  return results;
}