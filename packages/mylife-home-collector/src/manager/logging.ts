import { Readable } from 'stream';
import { bus, logger } from 'mylife-home-common';
import { Writer } from '../database/writer';

const log = logger.createLogger('mylife:home:collector:manager:logging');

export class Logging {
  private readonly stream: Readable;
  private readonly writer = new Writer<LogRecord>('log');

  constructor(transport: bus.Transport) {
    this.stream = transport.logger.createAggregatedReadableStream();

    this.stream.on('data', (chunk: Buffer) => {
      const record = parseRecord(chunk);
      if (!record) {
        return;
      }

      this.writer.write(record);
    });
  }

  async init() {
    await this.writer.init();
  }

  async terminate() {
    this.stream.destroy();
    this.writer.terminate();
  }
}

function parseRecord(chunk: Buffer) {
  try {
    return JSON.parse(chunk.toString()) as LogRecord;
  } catch (err) {
    log.error(err, 'Cannot parse stream chunk');
    return null;
  }
}

interface LogRecord {
  name: string;
  instanceName: string;
  hostname: string;
  pid: number;
  level: number;
  msg: string;
  time: string;
  v: number;
  err?: {
    message: string;
    name: string;
    stack: string;
  };
}
