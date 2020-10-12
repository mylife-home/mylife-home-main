export const enum ActionTypes {
  SET_NOTIFICATION = 'online-components-view/set-notification',
  CLEAR_NOTIFICATION = 'online-components-view/clear-notification',
  SET_PLUGIN = 'online-components-view/set-plugin',
  CLEAR_PLUGIN = 'online-components-view/clear-plugin',
  SET_COMPONENT = 'online-components-view/set-component',
  CLEAR_COMPONENT = 'online-components-view/clear-component',
  SET_STATE = 'online-components-view/set-state',
}

export { Component, Plugin, Member, PluginUsage, MemberType, ConfigItem } from '../../../../shared/online';

export interface OnlineComponentsViewState {
  notifierId: string;
//  components: { [name: string]: InstanceInfo };
}
