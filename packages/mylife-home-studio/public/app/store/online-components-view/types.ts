import { Member, PluginUsage, MemberType, ConfigItem, Plugin as NetPlugin, Component as NetComponent } from '../../../../shared/component-model';
import { Table } from '../common/types';

export const enum ActionTypes {
  SET_NOTIFICATION = 'online-components-view/set-notification',
  CLEAR_NOTIFICATION = 'online-components-view/clear-notification',
  SET_PLUGIN = 'online-components-view/set-plugin',
  CLEAR_PLUGIN = 'online-components-view/clear-plugin',
  SET_COMPONENT = 'online-components-view/set-component',
  CLEAR_COMPONENT = 'online-components-view/clear-component',
  SET_STATE = 'online-components-view/set-state',
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
