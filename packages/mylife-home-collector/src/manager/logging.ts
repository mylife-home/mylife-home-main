import { Readable } from 'stream';
import { bus, logger, tools } from 'mylife-home-common';
import { Writer } from '../database/writer';
import { LogRecord } from '../types/logging';

const log = logger.createLogger('mylife:home:collector:manager:logging');

export class Logging {
  private readonly stream: Readable;
  private readonly writer = new Writer<LogRecord>('log');

  constructor(transport: bus.Transport) {
    this.stream = transport.logger.createAggregatedReadableStream();

    this.stream.on('data', (chunk: Buffer) => {
      const streamRecord = parseRecord(chunk);
      if (!streamRecord) {
        return;
      }

      const record = convertRecord(streamRecord);
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
    return JSON.parse(chunk.toString()) as StreamLogRecord;
  } catch (err) {
    log.error(err, 'Cannot parse stream chunk');
    return null;
  }
}

function convertRecord(record: StreamLogRecord): LogRecord {
  return {
    time: new Date(record.time),
    v: LogRecord.VERSION,
    instanceName: record.instanceName,
    name: record.name,
    level: record.level,
    msg: record.msg,
    err: record.err,
  };
}

interface StreamLogRecord {
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
