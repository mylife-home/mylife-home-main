import { ImapFlowOptions, ImapFlow, MailboxObject } from 'imapflow';

export interface ConnectionSettings {
  readonly user: string;
  readonly password: string;
  readonly host: string;
  readonly port: number;
  readonly secure: boolean;
}

export default class Connection {
  private readonly options: ImapFlowOptions;
  private client: ImapFlow;

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
  }

  async close() {

  }

  private async open() {
    this.client = new ImapFlow(this.options);
    await this.client.connect();
    // this.client.on('close')
    // this.client.on('error')
    // this.client.on('exists')


    // No need for lock, we only open one mailbox
    const mailbox = await this.client.mailboxOpen('INBOX', { readOnly: true });
    //mailbox.
  }
}
