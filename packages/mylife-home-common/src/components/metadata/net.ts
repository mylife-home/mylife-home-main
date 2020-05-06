import { PluginUsage, MemberType } from './plugin';

export interface NetComponent {
  readonly id: string;
  readonly plugin: string;
}

export interface NetMember {
  readonly description: string;
  readonly memberType: MemberType;
  readonly valueType: string;
}

export interface NetPlugin {
  readonly name: string;
  readonly module: string;
  readonly usage: PluginUsage;
  readonly version: string;
  readonly description: string;
  readonly members: { [name: string]: NetMember; };
}