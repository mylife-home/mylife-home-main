import { EventEmitter } from 'events';
import { ImapFlowOptions, ImapFlow, FetchMessageObject, SequenceString, SearchObject } from 'imapflow';
import { logger } from 'mylife-home-common';
import { Message } from './types';

const log = logger.createLogger('mylife:home:core:plugins:driver-absoluta:engine:connection');
const imapFlowLogger = logger.createLogger('mylife:home:core:plugins:driver-absoluta:engine:imap-flow');

export interface ConnectionSettings {
  readonly user: string;
  readonly password: string;
  readonly host: string;
  readonly port: number;
  readonly secure: boolean;
}

// Missing ts API on ImapFlow, remove that when OK
// https://imapflow.com/module-imapflow-ImapFlow.html#close
interface Closable {
  close(): void;
}

export declare interface Connection extends EventEmitter {
  on(event: 'connected', listener: () => void): this;
  off(event: 'connected', listener: () => void): this;
  once(event: 'connected', listener: () => void): this;

  on(event: 'disconnected', listener: () => void): this;
  off(event: 'disconnected', listener: () => void): this;
  once(event: 'disconnected', listener: () => void): this;

  on(event: 'updated', listener: () => void): this;
  off(event: 'updated', listener: () => void): this;
  once(event: 'updated', listener: () => void): this;
}

export class Connection extends EventEmitter {
  private readonly options: ImapFlowOptions;
  private client: ImapFlow;

  private pendingOpen: boolean;
  private pendingClose: boolean;

  constructor(settings: ConnectionSettings) {
    super();

    this.options = {
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      auth: {
        user: settings.user,
        pass: settings.password
      },
      logger: new ImapFlowLogWrapper()
    };

    this.beginOpen();
  }

  close() {
    this.pendingClose = true;
    (this.client as unknown as Closable).close();
    this.client = null;
  }

  private async beginOpen() {
    // Do not retry if already trying or closing
    if (this.pendingOpen || this.pendingClose) {
      return;
    }

    // try to connect until close or until success
    while (true) {
      this.pendingOpen = true;
      const result = await this.safeOpen();
      this.pendingOpen = false;

      if (result || this.pendingClose) {
        return;
      }
    }
  }

  private async safeOpen(): Promise<boolean> {
    try {
      await this.open();
      return true;
    } catch (err) {
      log.error(err, 'Error while connecting to imap');
      return false;
    }
  }

  private reset() {
    log.debug('Disconnected');
    this.client.off('close', this.onClose);
    this.client.off('error', this.onError);
    this.client.off('exists', this.onUpdate);
    this.client = null;

    this.emit('disconnected');

    this.beginOpen();
  }

  private async open() {
    log.debug('Connecting');
    this.client = new ImapFlow(this.options);

    await this.client.connect();

    this.client.on('close', this.onClose);
    this.client.on('error', this.onError);
    this.client.on('exists', this.onUpdate);

    // No need for lock, we only open one mailbox
    await this.client.mailboxOpen('INBOX', { readOnly: true });

    log.info('Connected');

    this.emit('connected');
  }

  private readonly onClose = () => {
    log.info('Closed');
    this.reset();
  };

  private readonly onError = (err: Error) => {
    log.error(err, 'Got error');
    this.reset();
  };

  private readonly onUpdate = (data: { path: string, count: number, prevCount: number; }) => {
    log.debug(`Message count in '${data.path}' is ${data.count} (was ${data.prevCount})`);

    this.emit('updated');
  };

  async *fetch(pattern: SequenceString | number[] | SearchObject): AsyncGenerator<Message, void, unknown> {
    log.debug(`Begin fetch '${JSON.stringify(pattern)}'`);
    let msgCount = 0;

    for await (const msg of this.client.fetch(pattern, { envelope: true, bodyStructure: true, bodyParts: ['text'] })) {
      ++msgCount;
      const debugId = formatDebugId(msg);
      log.debug(`Fetching ${debugId}`);

      const bodyContent = decodeBodyContent(msg.bodyParts.get('text'));
      yield {
        seq: msg.seq,
        debugId,
        body: {
          type: msg.bodyStructure.type,
          content: bodyContent
        }
      };
    }

    log.debug(`End fetch (${msgCount} messages)`);
  }
}

function decodeBodyContent(content: Buffer) {
  const [first, ...parts] = content.toString('ascii').split('=');
  const formattedParts = parts.map(part => {
    const special = part.substr(0, 2);
    const rest = part.substr(2);

    // Only new line to respect 78 char rows
    if (special === '\r\n') {
      return rest;
    }

    // Else hex of char
    const code = parseInt(special, 16);
    const char = String.fromCharCode(code);

    return char + rest;
  });

  // reassemble ascii to buffer then decode it as utf8 (else utf8 of multi-part chars fail)
  const formatted = Buffer.from([first, ...formattedParts].join(''), 'ascii');

  return formatted.toString('utf8');
}

function formatDebugId(msg: FetchMessageObject) {
  const { from, date, subject } = msg.envelope;
  return `seq: ${msg.seq}, from: ${from[0].address}, date: ${date.toISOString()}, subject: '${subject}'`;
}

interface LogItem {
  msg: string;
  err: Error;
  // Note: other fields exist
}

class ImapFlowLogWrapper {
  debug(item: LogItem) {
    // Do not report debug logs
  }

  info(item: LogItem) {
    this.log('info', item);
  }

  warn(item: LogItem) {
    this.log('warn', item);
  }

  error(item: LogItem) {
    this.log('error', item);
  }

  private log(severity: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal', { err, msg }: LogItem) {
    if (err && msg) {
      imapFlowLogger[severity](err, msg);
    } else if (err) {
      imapFlowLogger[severity](err);
    } else {
      imapFlowLogger[severity](msg);
    }
  }
}
