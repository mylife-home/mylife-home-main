import { Component, Plugin } from './component-model';
// direct import to avoid require all common in ui
import { InstanceInfo } from 'mylife-home-common/dist/instance-info/types';

export { InstanceInfo };

export interface UpdateInstanceInfoData {
  operation: 'set' | 'clear';
  instanceName: string;
  data?: InstanceInfo;
}

export interface State {
  component: string;
  name: string;
  value: any;
}

export interface UpdateComponentData {
  operation: 'set' | 'clear';
  instanceName: string;
  type: 'plugin' | 'component' | 'state';
}

export interface ClearData extends UpdateComponentData {
  operation: 'clear';
  id: string;
}

export interface SetComponentData extends UpdateComponentData {
  operation: 'set';
  type: 'component';
  data: Component;
}

export interface SetPluginData extends UpdateComponentData {
  operation: 'set';
  type: 'plugin';
  data: Plugin;
}

export interface SetStateData extends UpdateComponentData {
  operation: 'set';
  type: 'state';
  data: State;
}

export interface HistoryRecord {
  timestamp: number;
  type: 'instance-set' | 'instance-clear' | 'component-set' | 'component-clear' | 'state-set';
}

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

export interface Status {
  transportConnected: boolean;
}