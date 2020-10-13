import { PluginUsage, Member, ConfigItem, Plugin as BasePlugin, Component as BaseComponent } from '../../../../shared/component-model';
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

export { PluginUsage, Member, ConfigItem };

export interface Plugin extends BasePlugin {
  id: string;
  instanceName: string;

  stateIds: string[]; // ordered alphabetically
  actionIds: string[]; // ordered alphabetically
  configIds: string[]; // ordered alphabetically
}

export interface Position {
  x: number;
  y: number;
}

export interface Component extends BaseComponent {
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
