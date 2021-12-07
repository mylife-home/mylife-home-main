import { components, bus } from 'mylife-home-common';
import { Service, BuildParams } from '../types';
import { Services } from '..';
import { StatusNotifier } from './status-notifier';
import { InstanceNotifier } from './instance-notifier';
import { ComponentNotifier } from './component-notifier';
import { HistoryNotifier } from './history-notifier';
import { Definition } from '../../../shared/ui-model';
import { ComponentConfig, BindingConfig } from '../../../shared/core-model';

export class Online implements Service {
  private readonly transport: bus.Transport;
  private readonly registry: components.Registry;
  private readonly statusNotifier: StatusNotifier;
  private readonly instanceNotifier: InstanceNotifier;
  private readonly componentNotifier: ComponentNotifier;
  private readonly historyNotifier: HistoryNotifier;

  constructor(params: BuildParams) {
    this.transport = params.transport;
    this.registry = new components.Registry({ transport: this.transport, publishRemoteComponents: true });
    this.statusNotifier = new StatusNotifier(this.transport);
    this.instanceNotifier = new InstanceNotifier(this.transport);
    this.componentNotifier = new ComponentNotifier(this.registry);
    this.historyNotifier = new HistoryNotifier(this.transport, this.registry);
  }

  async init() {
    await this.statusNotifier.init();
    await this.instanceNotifier.init();
    await this.componentNotifier.init();
    await this.historyNotifier.init();

    Services.instance.sessionManager.registerServiceHandler('online/start-notify-status', session => this.statusNotifier.startNotify(session));
    Services.instance.sessionManager.registerServiceHandler('online/stop-notify-status', (session, payload: any) => this.statusNotifier.stopNotify(session, payload));
    Services.instance.sessionManager.registerServiceHandler('online/start-notify-instance-info', session => this.instanceNotifier.startNotify(session));
    Services.instance.sessionManager.registerServiceHandler('online/stop-notify-instance-info', (session, payload: any) => this.instanceNotifier.stopNotify(session, payload));
    Services.instance.sessionManager.registerServiceHandler('online/start-notify-component', session => this.componentNotifier.startNotify(session));
    Services.instance.sessionManager.registerServiceHandler('online/stop-notify-component', (session, payload: any) => this.componentNotifier.stopNotify(session, payload));
    Services.instance.sessionManager.registerServiceHandler('online/start-notify-history', session => this.historyNotifier.startNotify(session));
    Services.instance.sessionManager.registerServiceHandler('online/stop-notify-history', (session, payload: any) => this.historyNotifier.stopNotify(session, payload));
    Services.instance.sessionManager.registerServiceHandler('online/execute-component-action', (session, payload: any) => this.executeComponentAction(payload));
    Services.instance.sessionManager.registerServiceHandler('online/execute-system-restart', (session, payload: any) => this.executeSystemRestart(payload));
    /* 
      online instances API should be published here, at least:
      - component config access
      - bindings config access
      Because this service should be the only entry point to update config, it can have a cache and notify on updates
    */
  }

  async terminate() {
    await this.statusNotifier.terminate();
    await this.instanceNotifier.terminate();
    await this.componentNotifier.terminate();
    await this.historyNotifier.terminate();

    this.registry.close();
  }

  getComponentsData() {
    return this.registry.getComponentsData();
  }

  getInstanceNames() {
    return this.registry.getInstanceNames();
  }

  getPlugins(instanceName: string) {
    return this.registry.getPlugins(instanceName);
  }

  getPlugin(instanceName: string, id: string) {
    return this.registry.getPlugin(instanceName, id);
  }

  findPlugin(instanceName: string, id: string) {
    return this.registry.findPlugin(instanceName, id);
  }

  getInstancesByCapability(capability: string) {
    return this.instanceNotifier.getInstancesByCapability(capability);
  }

  hasInstanceCapability(instanceName: string, capability: string) {
    return this.instanceNotifier.hasInstanceCapability(instanceName, capability);
  }

  checkInstanceCapability(instanceName: string, capability: string) {
    if (!this.hasInstanceCapability(instanceName, capability)) {
      throw new Error(`Instance '${instanceName}' does not have capability '${capability}'.'`)
    }
  }

  async uiSetDefinition(instanceName: string, definition: Definition) {
    this.checkInstanceCapability(instanceName, 'ui-api');
    await this.transport.rpc.call(instanceName, 'definition.set', definition);
  }

  async coreAddComponent(instanceName: string, config: ComponentConfig) {
    this.checkInstanceCapability(instanceName, 'components-api');
    await this.transport.rpc.call(instanceName, 'components.add', config);
  }

  async coreRemoveComponent(instanceName: string, id: string) {
    this.checkInstanceCapability(instanceName, 'components-api');
    await this.transport.rpc.call(instanceName, 'components.remove', { id });
  }

  async coreListComponents(instanceName: string): Promise<ComponentConfig[]> {
    this.checkInstanceCapability(instanceName, 'components-api');
    return await this.transport.rpc.call(instanceName, 'components.list');
  }

  async coreAddBinding(instanceName: string, config: BindingConfig) {
    this.checkInstanceCapability(instanceName, 'bindings-api');
    await this.transport.rpc.call(instanceName, 'bindings.add', config);
  }

  async coreRemoveBinding(instanceName: string, config: BindingConfig) {
    this.checkInstanceCapability(instanceName, 'bindings-api');
    await this.transport.rpc.call(instanceName, 'bindings.remove', config);
  }

  async coreListBindings(instanceName: string): Promise<BindingConfig[]> {
    this.checkInstanceCapability(instanceName, 'bindings-api');
    return await this.transport.rpc.call(instanceName, 'bindings.list');
  }

  async coreStoreSave(instanceName: string) {
    this.checkInstanceCapability(instanceName, 'store-api');
    await this.transport.rpc.call(instanceName, 'store.save', 5000); // store save may be slow on rpi
  }

  async executeComponentAction({ componentId, action, value }: { componentId: string, action: string, value: any; }) {
    const component = this.registry.getComponent(componentId);
    component.executeAction(action, value);
  };

  async executeSystemRestart({ instanceName, failSafe }: { instanceName: string, failSafe: boolean }) {
    this.checkInstanceCapability(instanceName, 'restart-api');
    await this.transport.rpc.call(instanceName, 'system.restart', { failSafe });
  }
}
