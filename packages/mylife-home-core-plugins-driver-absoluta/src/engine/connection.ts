import { EventEmitter } from 'events';
import { ImapFlowOptions, ImapFlow } from 'imapflow';
import { logger } from 'mylife-home-common';

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
    this.client.off('close', this.onClose);
    this.client.off('error', this.onError);
    this.client.off('exists', this.onUpdate);
    this.client = null;

    this.emit('disconnected');

    this.beginOpen();
  }

  private async open() {
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

  async fetch(pattern: string) {
    for await (const msg of this.client.fetch(pattern, { headers: ['FROM', 'SUBJECT'] })) {
      console.log(msg);
    }
  }
}

interface LogItem {
  msg: string;
  err: Error;
  // Note: other fields exist
}

class ImapFlowLogWrapper {
  debug({ err, msg }: LogItem) {
    // Do not report debug logs
  }

  info({ err, msg }: LogItem) {
    if (err) {
      imapFlowLogger.info(err, msg);
    } else {
      imapFlowLogger.info(msg);
    }
  }

  warn({ err, msg }: LogItem) {
    if (err) {
      imapFlowLogger.warn(err, msg);
    } else {
      imapFlowLogger.warn(msg);
    }
  }

  error({ err, msg }: LogItem) {
    if (err) {
      imapFlowLogger.error(err, msg);
    } else {
      imapFlowLogger.error(msg);
    }
  }
}
