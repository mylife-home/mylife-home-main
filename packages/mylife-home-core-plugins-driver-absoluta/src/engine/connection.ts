import { ImapFlowOptions, ImapFlow } from 'imapflow';
import { logger } from 'mylife-home-common';

const log = logger.createLogger('mylife:home:core:plugins:driver-absoluta:engine:connection');

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

export default class Connection {
  private readonly options: ImapFlowOptions;
  private client: ImapFlow;

  private pendingOpen: Promise<boolean>;
  private pendingClose: boolean;

  constructor(settings: ConnectionSettings) {
    this.options = {
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      auth: {
        user: settings.user,
        pass: settings.password
      }
    };

    this.beginOpen();
  }

  async close() {
    this.pendingClose = true;
    (this.client as unknown as Closable).close();
    this.client = null;

    // wait that pending connect terminate
    if (this.pendingOpen) {
      await this.pendingOpen;
    }
  }

  private async beginOpen() {
    // Do not retry if already trying or closing
    if (this.pendingOpen || this.pendingClose) {
      return;
    }

    // try to connect until close or until success
    while (true) {
      const promise = this.safeOpen();

      this.pendingOpen = promise;
      await promise;
      this.pendingOpen = null;

      if (promise || this.pendingClose) {
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

    this.beginOpen();
  }

  private async open() {
    this.client = new ImapFlow(this.options);

    await this.client.connect();

    this.client.on('close', this.onClose);
    this.client.on('error', this.onError);
    this.client.on('exists', this.onUpdate);

    // No need for lock, we only open one mailbox
    const mailbox = await this.client.mailboxOpen('INBOX', { readOnly: true });

    log.info('Connected');

    // TODO: emit: connected
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
    
    // TODO: emit: update
  };

}
