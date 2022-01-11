import { logger, bus, components } from 'mylife-home-common';
import { Writer } from '../database/writer';
import { HistoryRecord, InstanceHistoryRecord, ComponentSetHistoryRecord, ComponentClearHistoryRecord, StateHistoryRecord } from '../types/history';

const log = logger.createLogger('mylife:home:collector:manager:history');

export class History {
  private readonly writer = new Writer<HistoryRecord>('history');
  private readonly registry: components.Registry;

  private readonly components = new Map<string, ComponentNotifier>();
  private readonly context: NotifierContext;

  constructor(private readonly transport: bus.Transport) {
    this.registry = new components.Registry({ transport: this.transport, publishRemoteComponents: true });
    this.context = new NotifierContext(this.writer, this.registry);
  }

  async init() {
    await this.writer.init();

    if (this.transport.online) {
      this.context.addRecord({ ...makeBaseRecord(), type: 'self-set' });

      for (const instanceName of this.transport.presence.getOnlines()) {
        this.onInstanceChange(instanceName, true);
      }

      for (const { instanceName, component } of this.registry.getComponentsData()) {
        this.onComponentAdd(instanceName, component);
      }
    }

    this.transport.on('onlineChange', this.onOnlineChange);
    this.transport.presence.on('instanceChange', this.onInstanceChange);
    this.registry.on('component.add', this.onComponentAdd);
    this.registry.on('component.remove', this.onComponentRemove);
  }

  async terminate() {
    this.transport.off('onlineChange', this.onOnlineChange);
    this.transport.presence.off('instanceChange', this.onInstanceChange);
    this.registry.off('component.add', this.onComponentAdd);
    this.registry.off('component.remove', this.onComponentRemove);

    if (this.transport.online) {
      for (const instanceName of this.transport.presence.getOnlines()) {
        this.onInstanceChange(instanceName, false);
      }

      for (const { instanceName, component } of this.registry.getComponentsData()) {
        this.onComponentRemove(instanceName, component);
      }

      this.context.addRecord({ ...makeBaseRecord(), type: 'self-clear' });
    }

    this.registry.close();
    await this.writer.terminate();
  }

  private readonly onOnlineChange = (online: boolean) => {
    this.context.addRecord({ ...makeBaseRecord(), type: online ? 'self-set' : 'self-clear' });
  };

  private readonly onInstanceChange = (instanceName: string, online: boolean) => {
    const record: InstanceHistoryRecord = { ...makeBaseRecord(), type: online ? 'instance-set' : 'instance-clear', instanceName };
    this.context.addRecord(record);
  };

  private readonly onComponentAdd = (instanceName: string, netComponent: components.Component) => {
    const component = new ComponentNotifier(this.context, instanceName, netComponent);
    this.components.set(component.componentId, component);
  };

  private readonly onComponentRemove = (instanceName: string, { id }: components.Component) => {
    const component = this.components.get(id);
    this.components.delete(component.componentId);
    component.close();
  };
}

class NotifierContext {
  constructor(private readonly writer: Writer<HistoryRecord>, public readonly registry: components.Registry) {
  }

  addRecord(record: HistoryRecord) {
    this.writer.write(record);
  }
}

class ComponentNotifier {
  constructor(private readonly context: NotifierContext, private readonly instanceName: string, private readonly component: components.Component) {
    const plugin = components.metadata.encodePlugin(this.component.plugin);
    const record: ComponentSetHistoryRecord = { ...makeBaseRecord(), type: 'component-set', componentId: this.component.id, instanceName: this.instanceName, plugin, states: {} };

    for (const [name, value] of Object.entries(this.component.getStates())) {
      record.states[name] = value;
    }

    this.context.addRecord(record);

    this.component.on('state', this.onStateChange);
  }

  close() {
    this.component.off('state', this.onStateChange);

    const record: ComponentClearHistoryRecord = { ...makeBaseRecord(), type: 'component-clear', componentId: this.component.id };
    this.context.addRecord(record);
  }

  get componentId() {
    return this.component.id;
  }

  private readonly onStateChange = (stateName: string, stateValue: any) => {
    const record: StateHistoryRecord = { ...makeBaseRecord(), type: 'state-set', componentId: this.component.id, stateName, stateValue };
    this.context.addRecord(record);
  };
}

function makeBaseRecord() {
  return { time: new Date(), v: HistoryRecord.VERSION };
}