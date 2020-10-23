import { logger, components } from 'mylife-home-common';
import { SetPluginData, SetComponentData, SetStateData, State, ClearData } from '../../../shared/online';
import { Component } from '../../../shared/component-model';
import { Session, SessionNotifierManager } from '../session-manager';

const log = logger.createLogger('mylife:home:studio:services:online:component-notifier');

export class ComponentNotifier {
  private readonly notifiers = new SessionNotifierManager('online/component-notifiers', 'online/component');
  private readonly componentListeners = new Map<components.Component, (name: string, value: any) => void>();

  constructor(private readonly registry: components.Registry) {
    this.registry.on('plugin.add', this.onPluginAdd);
    this.registry.on('plugin.remove', this.onPluginRemove);
    this.registry.on('component.add', this.onComponentAdd);
    this.registry.on('component.remove', this.onComponentRemove);
  }

  init() {
    this.notifiers.init();
  }

  terminate() {
    this.registry.off('plugin.add', this.onPluginAdd);
    this.registry.off('plugin.remove', this.onPluginRemove);
    this.registry.off('component.add', this.onComponentAdd);
    this.registry.off('component.remove', this.onComponentRemove);

    for(const [component, listener] of this.componentListeners.entries()) {
      component.off('state', listener);
    }
    this.componentListeners.clear();
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

  private readonly onPluginAdd = (instanceName: string, plugin: components.metadata.Plugin) => {
    const update: SetPluginData = { type: 'plugin', operation: 'set', instanceName, data: components.metadata.encodePlugin(plugin) };
    this.notifiers.notifyAll(update);
  };

  private readonly onPluginRemove = (instanceName: string, plugin: components.metadata.Plugin) => {
    const update: ClearData = { type: 'plugin', operation: 'clear', instanceName, id: plugin.id };
    this.notifiers.notifyAll(update);
  };

  private readonly onComponentAdd = (instanceName: string, component: components.Component) => {
    const data: Component = { id: component.id, plugin: component.plugin.id };
    const update: SetComponentData = { type: 'component', operation: 'set', instanceName: instanceName, data };
    this.notifiers.notifyAll(update);

    for (const [name, value] of Object.entries(component.getStates())) {
      const data: State = { component: component.id, name, value };
      const update: SetStateData = { type: 'state', operation: 'set', instanceName, data };
      this.notifiers.notifyAll(update);
    }

    const listener = (name: string, value: any) => {
      this.onStateChange(instanceName, component.id, name, value);
    };

    component.on('state', listener);
    this.componentListeners.set(component, listener);
  };

  private readonly onComponentRemove = (instanceName: string, component: components.Component) => {
    const update: ClearData = { type: 'component', operation: 'clear', instanceName, id: component.id };
    this.notifiers.notifyAll(update);

    const listener = this.componentListeners.get(component);
    component.off('state', listener);
  };

  private readonly onStateChange(instanceName: string, component: string, name: string, value: any) {
    const data: State = { component, name, value };
    const update: SetStateData = { type: 'state', operation: 'set', instanceName, data };
    this.notifiers.notifyAll(update);
  };
}
