import * as shared from '../../../../shared/online';

export const enum ActionTypes {
  SET_NOTIFICATION = 'online-components-view/set-notification',
  CLEAR_NOTIFICATION = 'online-components-view/clear-notification',
  SET_PLUGIN = 'online-components-view/set-plugin',
  CLEAR_PLUGIN = 'online-components-view/clear-plugin',
  SET_COMPONENT = 'online-components-view/set-component',
  CLEAR_COMPONENT = 'online-components-view/clear-component',
  SET_STATE = 'online-components-view/set-state',
}

export { Member, PluginUsage, MemberType, ConfigItem } from '../../../../shared/online';

export interface Component extends shared.Component {
  instanceName: string;
}

export interface Plugin extends shared.Plugin {
  instanceName: string;
}

export interface State {
  instanceName: string;
  component: string;
  name: string;
  value: any;
}

export interface OnlineComponentsViewState {
  notifierId: string;
  plugins: { [uid: string]: Plugin };
  components: { [uid: string]: Component };
  states: { [uid: string]: State };
}
