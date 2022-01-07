export interface HistoryRecord {
  timestamp: number;
  type: 'instance-set' | 'instance-clear' | 'component-set' | 'component-clear' | 'state-set';
}

// TODO: match with "besoins"

export interface InstanceHistoryRecord extends HistoryRecord {
  type: 'instance-set' | 'instance-clear';
  instanceName: string;
}

export interface ComponentSetHistoryRecord extends HistoryRecord {
  type: 'component-set';
  instanceName: string;
  componentId: string;
  states?: { [name: string]: any; };
}

export interface ComponentClearHistoryRecord extends HistoryRecord {
  type: 'component-clear';
  instanceName: string;
  componentId: string;
}

export interface StateHistoryRecord extends HistoryRecord {
  type: 'state-set';
  instanceName: string;
  componentId: string;
  stateName: string;
  stateValue: any;
}
