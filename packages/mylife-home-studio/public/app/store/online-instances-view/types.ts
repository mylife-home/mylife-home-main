export const enum ActionTypes {
  SET_NOTIFICATION = 'online-instances-view/set-notification',
  CLEAR_NOTIFICATION = 'online-instances-view/clear-notification',
  PUSH_UPDATES = 'online-instances-view/push-updates',
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
