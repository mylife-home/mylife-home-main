import { InstanceInfo } from '../../../../shared/online';

export const enum ActionTypes {
  SET_NOTIFICATION = 'online-instances-view/set-notification',
  CLEAR_NOTIFICATION = 'online-instances-view/clear-notification',
  PUSH_UPDATES = 'online-instances-view/push-updates',
}

export { InstanceInfo }

export interface OnlineInstancesViewState {
  notifierId: string;
  instances: { [name: string]: InstanceInfo };
}

export interface NamedInstanceInfo extends InstanceInfo {
  instanceName: string;
}


export interface Update {
  type: 'set' | 'clear';
  instanceName: string;
}

export interface SetUpdate extends Update {
  type: 'set';
  data: InstanceInfo;
}

export interface ClearUpdate extends Update {
  type: 'clear';
}
