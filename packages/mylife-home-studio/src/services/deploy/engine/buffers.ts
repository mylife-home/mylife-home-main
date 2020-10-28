import { Readable, Writable } from 'stream';

class BufferReader extends Readable {
  constructor(buffer) {
    super();
    this.buffer = buffer;
  }

  _read() {
    this.push(this.buffer);
    this.push(null);
  }
}

class BufferWriter extends Writable {
  constructor() {
    super();
    this.buffers = [];
  }

  _write(chunk, encoding, callback) {
    this.buffers.push(chunk);
    callback();
  }

  _final(callback) {
    this.buffer = Buffer.concat(this.buffers);
    this.buffers = null;
    callback();
  }

  getBuffer() {
    return this.buffer;
  }
}

function once(fn) {
  const newFn = (...args) => {
    if (newFn.called) { return; }
    newFn.called = true;
    return fn(...args);
  };
  return newFn;
}

function apipe(...streams) {
  return new Promise((resolve, reject) => {
    const ended = once(err => (err ? reject(err) : resolve()));

    streams[streams.length - 1].once('finish', ended);
    for(let i=0; i<streams.length; ++i) {
      streams[i].once('error', ended);
      if(i > 0) {
        streams[i - 1].pipe(streams[i]);
      }
    }
  });
}

exports.BufferReader = BufferReader;
exports.BufferWriter = BufferWriter;
exports.apipe        = apipe;
