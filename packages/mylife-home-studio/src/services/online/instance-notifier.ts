import { EventEmitter } from 'events';
import { logger, bus, tools, instanceInfo } from 'mylife-home-common';
import { UpdateData } from '../../../shared/online';
import { Session, SessionNotifierManager } from '../session-manager';

const log = logger.createLogger('mylife:home:studio:services:online:instance-notifier');

export class InstanceNotifier {
  private readonly instanceInfos = new Map<string, InstanceInfo>();
  private readonly notifiers = new SessionNotifierManager('online/instance-info-notifiers', 'online/instance-info');

  constructor(private readonly transport: bus.Transport) {
    this.transport.presence.on('instanceChange', this.onInstanceChange);

    const localInstanceInfo = new LocalInstanceInfo();
    this.instanceInfos.set(localInstanceInfo.name, localInstanceInfo);

    for (const instanceName of this.transport.presence.getOnlines()) {
      this.onInstanceOnline(instanceName);
    }
  }

  init() {
    this.notifiers.init();
  }

  async terminate() {
    this.transport.presence.off('instanceChange', this.onInstanceChange);

    for (const instanceInfo of this.instanceInfos.values()) {
      instanceInfo.terminate();
    }
    this.instanceInfos.clear();
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
      const instanceInfo = new RemoteInstanceInfo(this.transport, view);
      this.instanceInfos.set(instanceName, instanceInfo);
      instanceInfo.on('change', this.onInstanceInfoChange);
    });
  }

  private onInstanceOffline(instanceName: string) {
    const instanceInfo = this.instanceInfos.get(instanceName) as RemoteInstanceInfo;
    if (!instanceInfo) {
      log.error(`Instance '${instanceName}' is going offline but we were not aware of it`);
      return;
    }

    this.instanceInfos.delete(instanceName);
    instanceInfo.terminate();

    const updateData: UpdateData = { operation: 'clear', instanceName };
    this.notifiers.notifyAll(updateData);
  }

  private onInstanceInfoChange = (data: instanceInfo.InstanceInfo, instanceName: string) => {
    const updateData: UpdateData = data ? { operation: 'set', instanceName, data } : { operation: 'clear', instanceName };
    this.notifiers.notifyAll(updateData);
  };

  async startNotifyInstanceInfo(session: Session) {
    const notifier = this.notifiers.createNotifier(session);

    // send infos after we reply
    setImmediate(() => {
      for (const instanceInfo of this.instanceInfos.values()) {
        if (instanceInfo.data) {
          const updateData: UpdateData = { operation: 'set', instanceName: instanceInfo.name, data: instanceInfo.data };
          notifier.notify(updateData);
        }
      }
    });

    return { notifierId: notifier.id };
  };

  async stopNotifyInstanceInfo(session: Session, { notifierId }: { notifierId: string; }) {
    this.notifiers.removeNotifier(session, notifierId);
  };
}

abstract class InstanceInfo extends EventEmitter {
  private _data: instanceInfo.InstanceInfo = null;

  constructor(public readonly name: string) {
    super();
  }

  abstract terminate(): void;

  protected change(newValue: instanceInfo.InstanceInfo) {
    this._data = newValue;
    this.emit('change', newValue, this.name);
  }

  get data() {
    return this._data;
  }
}

class LocalInstanceInfo extends InstanceInfo {
  private readonly unsubscribe: () => void;

  constructor() {
    super(tools.getDefine<string>('instance-name'));

    this.unsubscribe = instanceInfo.listenUpdates(this.onUpdate);

    setImmediate(() => {
      this.change(instanceInfo.get());
    });
  }

  terminate() {
    this.unsubscribe();
  }

  private onUpdate = (newData: instanceInfo.InstanceInfo) => {
    this.change(newData);
  };
}

const VIEW_PATH = 'instance-info';

class RemoteInstanceInfo extends InstanceInfo {
  constructor(private readonly transport: bus.Transport, private readonly view: bus.RemoteMetadataView) {
    super(view.remoteInstanceName);

    view.on('set', this.onSet);
    view.on('clear', this.onClear);

    setImmediate(() => {
      this.change(this.view.findValue(VIEW_PATH) || null);
    });
  }

  terminate() {
    tools.fireAsync(() => this.transport.metadata.closeView(this.view));
  }

  private onSet = (path: string, value: any) => {
    if (path === VIEW_PATH) {
      this.change(value);
    }
  };

  private onClear = (path: string) => {
    if (path === VIEW_PATH) {
      this.change(null);
    }
  };
}

