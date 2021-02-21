import { Readable, Stream, Writable } from 'stream';

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

export function apipe(first: Stream, ...piped: Writable[]) {
  return new Promise<void>((resolve, reject) => {
    const ended = once((err: Error) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });

    const streams = [first, ...piped];

    streams[streams.length - 1].once('finish', ended);

    for (const stream of streams) {
      stream.once('error', ended);
    }

    let prev = first;
    for (const stream of piped) {
      prev.pipe(stream);
      prev = stream;
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
