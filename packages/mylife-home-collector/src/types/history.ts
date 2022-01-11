import { components } from 'mylife-home-common';

export namespace HistoryRecord {
  export const VERSION = 1;
}

export interface HistoryRecord {
  time: Date;
  v: number;
  type: 'self-set' | 'self-clear' | 'instance-set' | 'instance-clear' | 'component-set' | 'component-clear' | 'state-set';

}

export interface InstanceHistoryRecord extends HistoryRecord {
  type: 'instance-set' | 'instance-clear';
  instanceName: string;
}

export interface ComponentSetHistoryRecord extends HistoryRecord {
  type: 'component-set';
  componentId: string;
  instanceName: string;
  plugin: components.metadata.NetPlugin;
  states: { [name: string]: any; };
}

export interface ComponentClearHistoryRecord extends HistoryRecord {
  type: 'component-clear';
  componentId: string;
}

export interface StateHistoryRecord extends HistoryRecord {
  type: 'state-set';
  componentId: string;
  stateName: string;
  stateValue: any;
}
