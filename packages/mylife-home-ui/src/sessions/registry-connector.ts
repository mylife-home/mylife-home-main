import { components, logger } from 'mylife-home-common';
import { ActionComponent } from '../../shared/model';
import { Reset, StateChange, ComponentAdd, ComponentRemove } from '../../shared/registry';
import { RequiredComponentState } from '../model';
import { Session } from '.';

const log = logger.createLogger('mylife:home:ui:sessions:registry-connector');

export class SessionsRegistryConnector {
  private readonly sessions = new Set<Session>();
  private readonly registryStateListeners = new Map<string, (name: string, value: any) => void>();
  private readonly requiredComponentStates = new Map<string, Set<string>>();

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

  setRequiredComponentStates(requiredComponentStates: RequiredComponentState[]) {
    this.requiredComponentStates.clear();

    for (const { componentId, componentState } of requiredComponentStates) {
      let requiredStates = this.requiredComponentStates.get(componentId);
      if (!requiredStates) {
        requiredStates = new Set<string>();
        this.requiredComponentStates.set(componentId, requiredStates);
      }

      requiredStates.add(componentState);
    }

    // send registry reset to all connected sessions
    this.sendState();
  }

  private isRequiredComponent(component: components.Component) {
    return !!this.requiredComponentStates.get(component.id);
  }

  private isRequiredComponentState(componendId: string, componentState: string) {
    const requiredStates = this.requiredComponentStates.get(componendId);
    return requiredStates && requiredStates.has(componentState);
  }

  private getRequiredComponentStates(component: components.Component) {
    const requiredStates = this.requiredComponentStates.get(component.id);
    const states: { [name: string]: any; } = {};

    for (const [key, value] of Object.entries(component.getStates())) {
      if (requiredStates.has(key)) {
        states[key] = value;
      }
    }

    return states;
  }

  addClient(session: Session) {
    this.sessions.add(session);
    session.on('action', this.onAction);

    this.sendState(session);
  }

  removeClient(session: Session) {
    this.sessions.delete(session);
    session.off('action', this.onAction);
  }

  private broadcast(eventName: string, message: any) {
    for (const session of this.sessions) {
      session.send(eventName, message);
    }
  }

  private sendState(session?: Session) {
    const state: Reset = {};
    for (const component of this.registry.getComponents()) {
      if (component.plugin.usage === components.metadata.PluginUsage.UI && this.isRequiredComponent(component)) {
        state[component.id] = this.getRequiredComponentStates(component);
      }
    }

    if (session) {
      session.send('state', state);
    } else {
      this.broadcast('state', state);
    }
  }

  private startListenChanges(component: components.Component) {
    const { id } = component;

    const listener = (name: string, value: any) => {
      if (this.isRequiredComponentState(id, name)) {
        const message: StateChange = { id, name, value };
        this.broadcast('change', message);
      }
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

    if (this.isRequiredComponent(component)) {
      const message: ComponentAdd = { id: component.id, attributes: this.getRequiredComponentStates(component) };
      this.broadcast('add', message);
    }
  };

  private readonly onComponentRemove = (instanceName: string, component: components.Component) => {
    if (component.plugin.usage !== components.metadata.PluginUsage.UI) {
      return;
    }

    this.stopListenChanges(component);

    if (this.isRequiredComponent(component)) {
      const message: ComponentRemove = { id: component.id };
      this.broadcast('remove', message);
    }
  };

  private readonly onAction = (data: ActionComponent) => {
    this.executeAction(data.id, data.action);
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
