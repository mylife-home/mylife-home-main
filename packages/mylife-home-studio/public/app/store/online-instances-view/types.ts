export const enum ActionTypes {
  SET_NOTIFICATION = 'online-instances-view/set-notification',
  CLEAR_NOTIFICATION = 'online-instances-view/clear-notification',
  SET_INSTANCE = 'online-instances-view/set-instance',
  CLEAR_INSTANCE = 'online-instances-view/clear-instance',
}

export interface OnlineInstancesViewState {
  notifierId: string;
  instances: { [name: string]: InstanceInfo };
}

export interface InstanceInfo {
  type: string;
  hardware: string;

  versions: {
    [component: string]: string;
  };

  systemBootTime: Date;
  instanceBootTime: Date;
  hostname: string;
  capabilities: string[];
}

export interface NamedInstanceInfo extends InstanceInfo {
  instanceName: string;
}
