import io from 'socket.io';
import { components, logger } from 'mylife-home-common';
import { ComponentAction } from '../../shared/actions';
import { Reset, StateChange, ComponentAdd, ComponentRemove } from '../../shared/registry';

const log = logger.createLogger('mylife:home:ui:sessions:registry-connector');

export class SessionsRegistryConnector {
  private readonly sockets = new Set<io.Socket>();
  private readonly registryStateListeners = new Map<string, (name: string, value: any) => void>();

  constructor(private readonly registry: components.Registry) {
    this.registry.on('component.add', this.onComponentAdd);
    this.registry.on('component.remove', this.onComponentRemove);

    for (const component of this.registry.getComponents()) {
      if (component.plugin.usage === components.metadata.PluginUsage.UI) {
        this.startListenChanges(component);
      }
    }
  }

  terminate() {
    this.registry.off('component.add', this.onComponentAdd);
    this.registry.off('component.remove', this.onComponentRemove);
  }

  addClient(socket: io.Socket) {
    this.sockets.add(socket);
    socket.on('action', this.onAction);

    this.sendState(socket);
 }

  removeClient(socket: io.Socket) {
    this.sockets.delete(socket);
    socket.off('action', this.onAction);
  }

  private broadcast(eventName: string, message: any) {
    for (const socket of this.sockets) {
      socket.emit(eventName, message);
    }
  }

  private sendState(socket: io.Socket) {
    const state: Reset = {};
    for (const component of this.registry.getComponents()) {
      if (component.plugin.usage === components.metadata.PluginUsage.UI) {
        state[component.id] = component.getStates();
      }
    }
    socket.emit('state', state);
 
  }

  private startListenChanges(component: components.Component) {
    const { id } = component;

    const listener = (name: string, value: any) => {
      const message: StateChange = { id, name, value };
      this.broadcast('change', message);
    };

    component.on('state', listener);
    this.registryStateListeners.set(id, listener);
  }

  private stopListenChanges(component: components.Component) {
    const { id } = component;
    const listener = this.registryStateListeners.get(id);
    component.off('state', listener);
    this.registryStateListeners.delete(id);
  }

  private readonly onComponentAdd = (instanceName: string, component: components.Component) => {
    if (component.plugin.usage !== components.metadata.PluginUsage.UI) {
      return;
    }

    this.startListenChanges(component);

    const message: ComponentAdd = { id: component.id, attributes: component.getStates() };
    this.broadcast('add', message);
  };

  private readonly onComponentRemove = (instanceName: string, component: components.Component) => {
    if (component.plugin.usage !== components.metadata.PluginUsage.UI) {
      return;
    }

    this.stopListenChanges(component);

    const message: ComponentRemove = { id: component.id };
    this.broadcast('remove', message);
  };

  private readonly onAction = (data: ComponentAction) => {
    this.executeAction(data.id, data.name);
  };

  private executeAction(componentId: string, actionName: string) {
    const component = this.registry.findComponent(componentId);
    if (!component) {
      log.info(`executeAction: component '${componentId}' not found`);
      return;
    }

    component.executeAction(actionName, true);
    component.executeAction(actionName, false);
  }
}
