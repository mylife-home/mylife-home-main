import { PluginUsage, Member, ConfigItem, MemberType, ConfigType, Plugin as NetPlugin, Component as NetComponent } from '../../../../shared/component-model';
import { DesignerNewTabData, OpenedProjectBase, DesignerState } from '../common/designer-types';
import { Table } from '../common/types';

export { DesignerNewTabData };

export interface CoreOpenedProject extends OpenedProjectBase {
  // TODO
  plugins: PluginsState;
  components: ComponentsState;
  bindings: BindingsState;
}

export type CoreDesignerState = DesignerState<CoreOpenedProject>;

export interface MoveComponentAction {
  tabId: string;
  componentId: string;
  position: Position;
}

export const enum ActionTypes {
  MOVE_COMPONENT = 'core-designer/move-component',
}

export { PluginUsage, Member, ConfigItem, MemberType, ConfigType };

export interface Plugin extends NetPlugin {
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

export interface Component extends NetComponent {
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
