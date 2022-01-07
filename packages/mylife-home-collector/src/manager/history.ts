import { logger, bus, components } from 'mylife-home-common';
import { Writer } from '../database/writer';
import { HistoryRecord, InstanceHistoryRecord, ComponentSetHistoryRecord, ComponentClearHistoryRecord, StateHistoryRecord } from '../types/history';

const log = logger.createLogger('mylife:home:collector:manager:history');

export class History {
  private readonly writer = new Writer<HistoryRecord>('history');
  private readonly componentListeners = new Map<components.Component, (name: string, value: any) => void>();
  private readonly registry: components.Registry;

  constructor(private readonly transport: bus.Transport) {
    this.registry = new components.Registry({ transport: this.transport, publishRemoteComponents: true });
    this.transport.presence.on('instanceChange', this.onInstanceChange);
    this.registry.on('component.add', this.onComponentAdd);
    this.registry.on('component.remove', this.onComponentRemove);
  }

  async init() {
    await this.writer.init();
  }

  async terminate() {
    this.transport.presence.off('instanceChange', this.onInstanceChange);
    this.registry.off('component.add', this.onComponentAdd);
    this.registry.off('component.remove', this.onComponentRemove);

    for (const [component, listener] of this.componentListeners.entries()) {
      component.off('state', listener);
    }
    this.componentListeners.clear();

    this.registry.close();

    await this.writer.terminate();
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
    this.writer.write(record);
  }
}
