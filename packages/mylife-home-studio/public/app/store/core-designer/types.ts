import { Table } from '../common/types';
import { NewTabData } from '../tabs/types';

export interface CoreDesignerNewTabData extends NewTabData {
  plugins: Plugin[];
  components: Component[];
  bindings: Binding[];
}

export interface MoveComponentAction {
  tabId: string;
  componentId: string;
  position: Position;
}

export const enum ActionTypes {
  MOVE_COMPONENT = 'core-designer/move-component',
}

// -- common definitions --

export const enum MemberType {
  ACTION = 'action',
  STATE = 'state',
}

export interface Member {
  description: string;
  memberType: MemberType;
  valueType: string;
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

// ----

export interface Plugin {
  id: string;
  instanceName: string;
  name: string;
  module: string;
  usage: PluginUsage;
  version: string;
  description: string;
  members: { [name: string]: Member; };
  config: { [name: string]: ConfigItem; };

  stateIds: string[]; // ordered alphabetically
  actionIds: string[]; // ordered alphabetically
  configIds: string[]; // ordered alphabetically
}

export interface Position {
  x: number;
  y: number;
}

export interface Component {
  id: string;
  plugin: string;
  config: { [name: string]: any; };
  position: Position;
}

export interface Binding {
  id: string;
  sourceComponent: string;
  sourceState: string;
  targetComponent: string;
  targetAction: string;
}

export type PluginsState = Table<Plugin>;
export type ComponentsState = Table<Component>;
export type BindingsState = Table<Binding>;

export interface CoreDesignerState {
  plugins: PluginsState;
  components: ComponentsState;
  bindings: BindingsState;
}

export type CoreDesignersState = { [tabKey: string]: CoreDesignerState; };