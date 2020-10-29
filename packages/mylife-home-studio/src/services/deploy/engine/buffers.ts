import { Readable, Writable } from 'stream';

export class BufferReader extends Readable {
  constructor(private readonly buffer: Buffer) {
    super();
  }

  _read() {
    this.push(this.buffer);
    this.push(null);
  }
}

export class BufferWriter extends Writable {
  private buffers: Buffer[] = [];
  private buffer: Buffer = null;

  constructor() {
    super();
  }

  _write(chunk: Buffer, encoding: BufferEncoding, callback: (error?: Error | null) => void) {
    this.buffers.push(chunk);
    callback();
  }

  _final(callback: (error?: Error | null) => void) {
    this.buffer = Buffer.concat(this.buffers);
    this.buffers = null;
    callback();
  }

  getBuffer() {
    return this.buffer;
  }
}

export function apipe(...streams: Writable[]) {
  return new Promise((resolve, reject) => {
    const ended = once((err: Error) => (err ? reject(err) : resolve()));

    streams[streams.length - 1].once('finish', ended);
    for(let i=0; i<streams.length; ++i) {
      streams[i].once('error', ended);
      if(i > 0) {
        streams[i - 1].pipe(streams[i]);
      }
    }
  });
}

function once(target: (...args: any) => void) {
  let called = false;

  return (...args: any) => {
    if (called) {
      return;
    }

    called = true;
    return target(...args);
  };
}