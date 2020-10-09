import { EventEmitter } from 'events';
import { logger, bus, tools } from 'mylife-home-common';
import { UpdateData } from '../../shared/online';
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
      const instanceInfo = new InstanceInfo(view);
      this.instanceInfos.set(instanceName, instanceInfo);
      instanceInfo.on('change', this.onInstanceInfoChange);
    });
  }

  private onInstanceOffline(instanceName: string) {
    const instanceInfo = this.instanceInfos.get(instanceName);
    if (!instanceInfo) {
      log.error(`Instance '${instanceName}' is going offline but we were not aware of it`);
      return;
    }

    this.instanceInfos.delete(instanceName);
    tools.fireAsync(() => this.transport.metadata.closeView(instanceInfo.view));

    const updateData: UpdateData = { operation: 'clear', instanceName };
    this.notifiers.notifyAll(updateData);
  }

  private onInstanceInfoChange = (data: tools.InstanceInfo, instanceName: string) => {
    const updateData: UpdateData = data ? { operation: 'set', instanceName, data } : { operation: 'clear', instanceName };
    this.notifiers.notifyAll(updateData);
  };

  private startNotifyInstanceInfo = async (session: Session) => {
    const notifier = this.notifiers.createNotifier(session);

    // send infos after we reply
    setImmediate(() => {
      for (const instanceInfo of this.instanceInfos.values()) {
        if (instanceInfo.data) {
          const updateData: UpdateData = { operation: 'set', instanceName: instanceInfo.name, data: instanceInfo.data }
          notifier.notify(updateData);
        }
      }
    });

    return { notifierId: notifier.id };
  };

  private stopNotifyInstanceInfo = async (session: Session, { notifierId }: { notifierId: string; }) => {
    this.notifiers.removeNotifier(session, notifierId);
  };
}

const VIEW_PATH = 'instance-info';

class InstanceInfo extends EventEmitter {
  private _data: tools.InstanceInfo = null;

  constructor(public readonly view: bus.RemoteMetadataView) {
    super();

    view.on('set', this.onSet);
    view.on('clear', this.onClear);

    setImmediate(() => {
      this.change(this.view.findValue(VIEW_PATH) || null);
    });
  }

  private onSet = (path: string, value: any) => {
    if (path === VIEW_PATH) {
      this._data = value;
    }
  };

  private onClear = (path: string) => {
    if (path === VIEW_PATH) {
      this._data = null;
    }
  };

  private change(newValue: tools.InstanceInfo) {
    this._data = newValue;
    this.emit('change', newValue, this.name);
  }

  get name() {
    return this.view.remoteInstanceName;
  }

  get data() {
    return this._data;
  }
}

