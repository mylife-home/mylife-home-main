import { EventEmitter } from 'events';
import { logger, bus, tools, components } from 'mylife-home-common';
import { SetPluginData, SetComponentData, Component, SetStateData, State } from '../../../shared/online';
import { Session, SessionNotifierManager } from '../session-manager';

const log = logger.createLogger('mylife:home:studio:services:online:component-notifier');

export class ComponentNotifier {
  private readonly registry: components.Registry;
  private readonly notifiers = new SessionNotifierManager('online/component-notifiers', 'online/component');

  constructor(private readonly transport: bus.Transport) {
    this.registry = new components.Registry({ transport, publishRemoteComponents: true });
  }

  init() {
    this.notifiers.init();
  }

  terminate() {
    this.registry.close();
  }

  async startNotify(session: Session) {
    const notifier = this.notifiers.createNotifier(session);

    // send infos after we reply
    setImmediate(() => {
      for (const instanceName of this.registry.getInstanceNames()) {
        for (const plugin of this.registry.getPlugins(instanceName)) {
          const update: SetPluginData = { type: 'plugin', operation: 'set', instanceName, data: components.metadata.encodePlugin(plugin) };
          notifier.notify(update);
        }
      }

      for (const componentData of this.registry.getComponentsData()) {
        const data: Component = { id: componentData.component.id, plugin: componentData.component.plugin.id };
        const update: SetComponentData = { type: 'component', operation: 'set', instanceName: componentData.instanceName, data };
        notifier.notify(update);
      }

      for (const componentData of this.registry.getComponentsData()) {
        for (const [name, value] of Object.entries(componentData.component.getStates())) {
          const data: State = { component: componentData.component.id, name, value };
          const update: SetStateData = { type: 'state', operation: 'set', instanceName: componentData.instanceName, data };
          notifier.notify(update);
        }
      }
    });

    return { notifierId: notifier.id };
  };

  async stopNotify(session: Session, { notifierId }: { notifierId: string; }) {
    this.notifiers.removeNotifier(session, notifierId);
  };
}
