// direct import to avoid require all common in ui
import { NetComponent as Component, NetPlugin as Plugin, NetMember as Member } from 'mylife-home-common/dist/components/metadata/net';
import { PluginUsage, MemberType, ConfigItem } from 'mylife-home-common/dist/components/metadata/plugin';

// TODO: same that common/tools/intance-info
export interface InstanceInfo {
  type: string;
  hardware: string;

  versions: {
    [component: string]: string;
  };

  systemBootTime: number;
  instanceBootTime: number;
  hostname: string;
  capabilities: string[];
}

export interface UpdateInstanceInfoData {
  operation: 'set' | 'clear';
  instanceName: string;
  data?: InstanceInfo;
}

export { Component, Plugin, Member, PluginUsage, MemberType, ConfigItem };

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
