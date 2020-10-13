import { Component, Plugin } from './component-model';
// direct import to avoid require all common in ui
import { InstanceInfo } from 'mylife-home-common/dist/instance-info/types';

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
