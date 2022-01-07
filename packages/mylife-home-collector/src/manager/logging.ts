import { Readable } from 'stream';
import { bus, logger } from 'mylife-home-common';
import { Writer } from '../database/writer';
import { LogRecord } from '../types/logging';

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
    await this.writer.terminate();
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
