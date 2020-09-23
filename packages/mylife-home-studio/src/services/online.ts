import { logger, bus, tools } from 'mylife-home-common';
import { Service, BuildParams } from './types';
import { Services } from '.';
import { Session, SessionNotifierManager } from './session-manager';

const log = logger.createLogger('mylife:home:studio:services:online');

export class Online implements Service {
  private readonly transport: bus.Transport;
  private readonly instanceInfos = new Map<string, InstanceInfo>();
  private readonly notifiers = new SessionNotifierManager('online/instance-info-notifiers', 'online/instance-info');

  constructor(params: BuildParams) {
    this.transport = params.transport;
    this.transport.presence.on('instanceChange', this.onInstanceChange);

    for (const instanceName of this.transport.presence.getOnlines()) {
      this.onInstanceOnline(instanceName);
    }
  }

  async init() {
    this.notifiers.init();
    Services.instance.sessionManager.registerServiceHandler('online/start-notify-instance-info', this.startNotifyInstanceInfo);
    Services.instance.sessionManager.registerServiceHandler('online/stop-notify-instance-info', this.stopNotifyInstanceInfo);
  }

  async terminate() {
    this.transport.presence.off('instanceChange', this.onInstanceChange);
  }

  private readonly onInstanceChange = (instanceName: string, online: boolean) => {
    if (online) {
      this.onInstanceOnline(instanceName);
    } else {
      this.onInstanceOffline(instanceName);
    }
  };

  private onInstanceOnline(instanceName: string) {
    tools.fireAsync(async () => {
      const view = await this.transport.metadata.createView(instanceName);
      this.instanceInfos.set(instanceName, new InstanceInfo(view));
    });
    this.notifiers.notifyAll({ newInstance: instanceName });
  }

  private onInstanceOffline(instanceName: string) {
    const instanceInfo = this.instanceInfos.get(instanceName);
    if (!instanceInfo) {
      log.error(`Instance '${instanceName}' is going offline but we were not aware of it`);
      return;
    }

    this.instanceInfos.delete(instanceName);
    tools.fireAsync(() => this.transport.metadata.closeView(instanceInfo.view));
    this.notifiers.notifyAll({ removeInstance: instanceName });
  }

  private startNotifyInstanceInfo = async (session: Session) => {
    const notifier = this.notifiers.createNotifier(session);

    // send infos after we reply
    setImmediate(() => {
      for (const instanceInfo of this.instanceInfos.values()) {
        notifier.notify({ newInstance: instanceInfo.name });
      }
    });

    return { notifierId: notifier.id };
  };

  private stopNotifyInstanceInfo = async (session: Session, { notifierId }: { notifierId: string; }) => {
    this.notifiers.removeNotifier(session, notifierId);
  };
}

class InstanceInfo {
  constructor(public readonly view: bus.RemoteMetadataView) {
  }

  get name() {
    return this.view.remoteInstanceName;
  }
}

