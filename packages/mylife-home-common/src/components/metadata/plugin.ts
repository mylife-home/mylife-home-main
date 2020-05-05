import { Type } from './types';

export const enum MemberType {
  ACTION = 'action',
  STATE = 'state',
}

export interface Member {
  readonly description: string;
  readonly memberType: MemberType;
  readonly valueType: Type;
}

export const enum PluginUsage {
  SENSOR = 'sensor',
  ACTUATOR = 'actuator',
  LOGIC = 'logic',
  UI = 'ui'
}

export interface Plugin {
  readonly name: string;
  readonly description: string;
  readonly usage: PluginUsage;
  readonly module: string;
  readonly members: { [name: string]: Member; };
}
