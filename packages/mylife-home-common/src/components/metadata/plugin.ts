import { Type, parseType } from './types';
import { NetPlugin, NetMember } from './net';

export const enum MemberType {
  ACTION = 'action',
  STATE = 'state',
}

export interface Member {
  readonly description: string;
  readonly memberType: MemberType;
  readonly valueType: Type;
}

export const enum ConfigType {
  STRING = 'string',
  BOOL = 'bool',
  INTEGER = 'integer',
  FLOAT = 'float',
}

export interface ConfigItem {
  readonly description: string;
  readonly valueType: ConfigType;
}

export const enum PluginUsage {
  SENSOR = 'sensor',
  ACTUATOR = 'actuator',
  LOGIC = 'logic',
  UI = 'ui'
}

export interface Plugin {
  readonly id: string;
  readonly name: string;
  readonly module: string;
  readonly usage: PluginUsage;
  readonly version: string;
  readonly description: string;
  readonly members: { [name: string]: Member; };
  readonly config: { [name: string]: ConfigItem; };
}

export function encodePlugin(plugin: Plugin): NetPlugin {
  const { id, members, ...commonsProps } = plugin;

  const netMembers: { [name: string]: NetMember; } = {};
  for (const [name, member] of Object.entries(members)) {
    const { valueType, ...commonsProps } = member;
    const netValueType = valueType.toString();
    netMembers[name] = { ...commonsProps, valueType: netValueType };
  }

  return { ...commonsProps, members: netMembers };
}

export function decodePlugin(netPlugin: NetPlugin): Plugin {
  const { members: netMembers, ...commonsProps } = netPlugin;

  const members: { [name: string]: Member; } = {};
  for (const [name, member] of Object.entries(netMembers)) {
    const { valueType: netValueType, ...commonsProps } = member;
    const valueType = parseType(netValueType);
    members[name] = { ...commonsProps, valueType };
  }

  const id = `${commonsProps.module}.${commonsProps.name}`;

  return { ...commonsProps, id, members };
}
