import { logger, bus } from 'mylife-home-common';
import { Status } from '../../../shared/online';
import { Session, SessionNotifierManager } from '../session-manager';

export class StatusNotifier {
  private readonly notifiers = new SessionNotifierManager('online/status-notifiers', 'online/status');

  private status: Status = {
    transportConnected: null
  };

  constructor(private readonly transport: bus.Transport) {
    this.transport.on('onlineChange', this.onOnlineChange);
    
    this.onOnlineChange(this.transport.online);
  }

  init() {
    this.notifiers.init();
  }

  async terminate() {
    this.transport.presence.off('onlineChange', this.onOnlineChange);
  }

  private readonly onOnlineChange = (online: boolean) => {
    this.updateStatus({ transportConnected: online });
  };

  private updateStatus(props: Partial<Status>) {
    this.status = { ...this.status, ...props };

    this.notifiers.notifyAll(this.status);
  }

  async startNotify(session: Session) {
    const notifier = this.notifiers.createNotifier(session);

    // send infos after we reply
    setImmediate(() => {
      notifier.notify(this.status);
    });

    return { notifierId: notifier.id };
  };

  async stopNotify(session: Session, { notifierId }: { notifierId: string; }) {
    this.notifiers.removeNotifier(session, notifierId);
  };
}
