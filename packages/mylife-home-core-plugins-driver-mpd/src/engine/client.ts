// From: https://github.com/andrewrk/mpd.js/blob/master/index.js

import { EventEmitter } from 'events';
import assert from 'assert';
import net from 'net';
import { logger, tools } from 'mylife-home-common';

const log = logger.createLogger('mylife:home:core:plugins:driver-mpd:engine:client');

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
}

export class MpdClient extends EventEmitter {
  private buffer = '';
  private msgHandlerQueue = [];
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

  private readonly receive = (data: Buffer) => {

  };
}

MpdClient.Command = Command;
MpdClient.cmd = cmd;
MpdClient.parseKeyValueMessage = parseKeyValueMessage;
MpdClient.parseArrayMessage = parseArrayMessage;

MpdClient.prototype.receive = function (data) {
  var m;
  this.buffer += data;
  while (m = this.buffer.match(MPD_SENTINEL)) {
    var msg = this.buffer.substring(0, m.index)
      , line = m[0]
      , code = m[1]
      , str = m[2];
    if (code === "ACK") {
      var err = new Error(str);
      this.handleMessage(err);
    } else if (OK_MPD.test(line)) {
      this.setupIdling();
    } else {
      this.handleMessage(null, msg);
    }

    this.buffer = this.buffer.substring(msg.length + line.length + 1);
  }
};

MpdClient.prototype.handleMessage = function (err, msg) {
  var handler = this.msgHandlerQueue.shift();
  handler(err, msg);
};

MpdClient.prototype.setupIdling = function () {
  var self = this;
  self.sendWithCallback("idle", function (err, msg) {
    self.handleIdleResultsLoop(err, msg);
  });
  self.idling = true;
  self.emit('ready');
};

MpdClient.prototype.sendCommand = function (command, callback) {
  var self = this;
  callback = callback || noop.bind(this);
  assert.ok(self.idling);
  self.send("noidle\n");
  self.sendWithCallback(command, callback);
  self.sendWithCallback("idle", function (err, msg) {
    self.handleIdleResultsLoop(err, msg);
  });
};

MpdClient.prototype.sendCommands = function (commandList, callback) {
  var fullCmd = "command_list_begin\n" + commandList.join("\n") + "\ncommand_list_end";
  this.sendCommand(fullCmd, callback || noop.bind(this));
};

MpdClient.prototype.handleIdleResultsLoop = function (err, msg) {
  var self = this;
  if (err) {
    self.emit('error', err);
    return;
  }
  self.handleIdleResults(msg);
  if (self.msgHandlerQueue.length === 0) {
    self.sendWithCallback("idle", function (err, msg) {
      self.handleIdleResultsLoop(err, msg);
    });
  }
};

MpdClient.prototype.handleIdleResults = function (msg) {
  var self = this;
  msg.split("\n").forEach(function (system) {
    if (system.length > 0) {
      var name = system.substring(9);
      self.emit('system-' + name);
      self.emit('system', name);
    }
  });
};

MpdClient.prototype.sendWithCallback = function (cmd, cb) {
  cb = cb || noop.bind(this);
  this.msgHandlerQueue.push(cb);
  this.send(cmd + "\n");
};

MpdClient.prototype.send = function (data) {
  this.socket.write(data);
};

function Command(name, args) {
  this.name = name;
  this.args = args;
}

Command.prototype.toString = function () {
  return this.name + " " + this.args.map(argEscape).join(" ");
};

function argEscape(arg) {
  // replace all " with \"
  return '"' + arg.toString().replace(/"/g, '\\"') + '"';
}

function noop(err) {
  if (err) this.emit('error', err);
}

// convenience
function cmd(name, args) {
  return new Command(name, args);
}

function parseKeyValueMessage(msg) {
  var result = {};

  msg.split('\n').forEach(function (p) {
    if (p.length === 0) {
      return;
    }
    var keyValue = p.match(/([^ ]+): (.*)/);
    if (keyValue == null) {
      throw new Error('Could not parse entry "' + p + '"');
    }
    result[keyValue[1]] = keyValue[2];
  });
  return result;
}

function parseArrayMessage(msg) {
  var results = [];
  var obj = {};

  msg.split('\n').forEach(function (p) {
    if (p.length === 0) {
      return;
    }
    var keyValue = p.match(/([^ ]+): (.*)/);
    if (keyValue == null) {
      throw new Error('Could not parse entry "' + p + '"');
    }

    if (obj[keyValue[1]] !== undefined) {
      results.push(obj);
      obj = {};
      obj[keyValue[1]] = keyValue[2];
    }
    else {
      obj[keyValue[1]] = keyValue[2];
    }
  });
  results.push(obj);
  return results;
}