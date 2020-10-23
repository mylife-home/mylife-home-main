import { logger, bus, components } from 'mylife-home-common';
import { HistoryRecord, InstanceHistoryRecord, ComponentSetHistoryRecord, ComponentClearHistoryRecord, StateHistoryRecord } from '../../../shared/online';
import { Session, SessionNotifierManager } from '../session-manager';
import { CircularBuffer } from '../../utils/circular-buffer';

const log = logger.createLogger('mylife:home:studio:services:online:history-notifier');

export class HistoryNotifier {
  private readonly notifiers = new SessionNotifierManager('online/history-notifiers', 'online/history');
  private readonly buffer = new CircularBuffer<HistoryRecord>(1000);
  private readonly componentListeners = new Map<components.Component, (name: string, value: any) => void>();

  constructor(private readonly transport: bus.Transport, private readonly registry: components.Registry) {
    this.transport.presence.on('instanceChange', this.onInstanceChange);
    this.registry.on('component.add', this.onComponentAdd);
    this.registry.on('component.remove', this.onComponentRemove);
  }

  init() {
    this.notifiers.init();
  }

  terminate() {
    this.transport.presence.off('instanceChange', this.onInstanceChange);
    this.registry.off('component.add', this.onComponentAdd);
    this.registry.off('component.remove', this.onComponentRemove);

    for (const [component, listener] of this.componentListeners.entries()) {
      component.off('state', listener);
    }
    this.componentListeners.clear();

    this.buffer.clear();
  }

  private readonly onInstanceChange = (instanceName: string, online: boolean) => {
    this.addRecord({ timestamp: Date.now(), type: online ? 'instance-set' : 'instance-clear', instanceName } as InstanceHistoryRecord);
  };

  private readonly onComponentAdd = (instanceName: string, component: components.Component) => {
    const states = component.getStates();
    this.addRecord({ timestamp: Date.now(), type: 'component-set', instanceName, componentId: component.id, states } as ComponentSetHistoryRecord);

    const listener = (name: string, value: any) => {
      this.onStateChange(instanceName, component.id, name, value);
    };

    component.on('state', listener);
    this.componentListeners.set(component, listener);
  };

  private readonly onComponentRemove = (instanceName: string, component: components.Component) => {
    this.addRecord({ timestamp: Date.now(), type: 'component-clear', instanceName, componentId: component.id } as ComponentClearHistoryRecord);

    const listener = this.componentListeners.get(component);
    component.off('state', listener);
  };

  private onStateChange(instanceName: string, componentId: string, stateName: string, stateValue: any) {
    this.addRecord({ timestamp: Date.now(), type: 'state-set', instanceName, componentId, stateName, stateValue } as StateHistoryRecord);
  };

  private addRecord(record: HistoryRecord) {
    this.buffer.push(record);
    this.notifiers.notifyAll(record);
  }

  async startNotify(session: Session) {
    const notifier = this.notifiers.createNotifier(session);

    // send events after we reply
    const records = this.buffer.toArray();
    setImmediate(() => {
      for (const record of records) {
        notifier.notify(record);
      }
    });

    return { notifierId: notifier.id };
  };

  async stopNotify(session: Session, { notifierId }: { notifierId: string; }) {
    this.notifiers.removeNotifier(session, notifierId);
  };
}
