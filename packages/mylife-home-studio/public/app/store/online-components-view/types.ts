import { Member, PluginUsage, MemberType, ConfigItem, Plugin as NetPlugin, Component as NetComponent } from '../../../../shared/component-model';
import { Table } from '../common/types';

export const enum ActionTypes {
  SET_NOTIFICATION = 'online-components-view/set-notification',
  CLEAR_NOTIFICATION = 'online-components-view/clear-notification',
  PUSH_UPDATES = 'online-components-view/push-updates',
  EXECUTE_COMPONENT_ACTION = 'online-components-view/execute-component-action',
}

export { Member, PluginUsage, MemberType, ConfigItem, NetPlugin, NetComponent };

export interface Component extends NetComponent {
  // id is used for global unique id
  display: string;
  instance: string;
  states: string[];
}

export interface Plugin extends NetPlugin {
  id: string;
  display: string;
  instance: string;

  stateIds: string[]; // ordered alphabetically
  actionIds: string[]; // ordered alphabetically
  configIds: string[]; // ordered alphabetically

  components: string[];
}

export interface Instance {
  id: string;
  display: string;
  plugins: string[];
  components: string[];
}

export interface State {
  id: string;
  instance: string;
  component: string;
  name: string;
  value: any;
}

export interface OnlineComponentsViewState {
  notifierId: string;
  instances: Table<Instance>;
  plugins: Table<Plugin>;
  components: Table<Component>;
  states: Table<State>;
}

export interface Update {
  type: 'set-plugin' | 'clear-plugin' | 'set-component' | 'clear-component' | 'set-state';
  instanceName: string;
}

export interface SetPluginUpdate extends Update {
  type: 'set-plugin';
  plugin: NetPlugin;
}

export interface ClearPluginUpdate extends Update {
  type: 'clear-plugin';
  id: string;
}

export interface SetComponentUpdate extends Update {
  type: 'set-component';
  component: NetComponent;
}

export interface ClearComponentUpdate extends Update {
  type: 'clear-component';
  id: string;
}

export interface SetStateUpdate extends Update {
  type: 'set-state';
  component: string;
  name: string;
  value: any;
}
