import { components, bus } from 'mylife-home-common';
import { Service, BuildParams } from '../types';
import { Services } from '..';
import { InstanceNotifier } from './instance-notifier';
import { ComponentNotifier } from './component-notifier';
import { HistoryNotifier } from './history-notifier';
import { Definition } from '../../../shared/ui-model';

/* 
  online instances API should be published here, at least:
   - component config access
   - bindings config access
  Because this service should be the only entry point to update config, it can have a cache and notify on updates
*/
export class Online implements Service {
  private readonly transport: bus.Transport;
  private readonly registry: components.Registry;
  private readonly instanceNotifier: InstanceNotifier;
  private readonly componentNotifier: ComponentNotifier;
  private readonly historyNotifier: HistoryNotifier;

  constructor(params: BuildParams) {
    this.transport = params.transport;
    this.registry = new components.Registry({ transport: this.transport, publishRemoteComponents: true });
    this.instanceNotifier = new InstanceNotifier(this.transport);
    this.componentNotifier = new ComponentNotifier(this.registry);
    this.historyNotifier = new HistoryNotifier(this.transport, this.registry);
  }

  async init() {
    await this.instanceNotifier.init();
    await this.componentNotifier.init();
    await this.historyNotifier.init();

    Services.instance.sessionManager.registerServiceHandler('online/start-notify-instance-info', session => this.instanceNotifier.startNotify(session));
    Services.instance.sessionManager.registerServiceHandler('online/stop-notify-instance-info', (session, payload: any) => this.instanceNotifier.stopNotify(session, payload));
    Services.instance.sessionManager.registerServiceHandler('online/start-notify-component', session => this.componentNotifier.startNotify(session));
    Services.instance.sessionManager.registerServiceHandler('online/stop-notify-component', (session, payload: any) => this.componentNotifier.stopNotify(session, payload));
    Services.instance.sessionManager.registerServiceHandler('online/start-notify-history', session => this.historyNotifier.startNotify(session));
    Services.instance.sessionManager.registerServiceHandler('online/stop-notify-history', (session, payload: any) => this.historyNotifier.stopNotify(session, payload));
  }

  async terminate() {
    await this.instanceNotifier.terminate();
    await this.componentNotifier.terminate();
    await this.historyNotifier.terminate();

    this.registry.close();
  }

  getComponentsData() {
    return this.registry.getComponentsData();
  }

  getInstancesByCapability(capability: string) {
    return this.instanceNotifier.getInstancesByCapability(capability);
  }

  async uiSetDefinition(instanceName: string, definition: Definition) {
    await this.transport.rpc.call(instanceName, 'definition.set', definition);
  }
}
