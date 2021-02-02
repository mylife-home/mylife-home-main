import { PluginUsage, Member, ConfigItem, MemberType, ConfigType, Plugin as NetPlugin, Component as NetComponent } from '../../../../shared/component-model';
import { CoreBindingData, CoreComponentData, CorePluginData } from '../../../../shared/project-manager';
import { DesignerTabActionData, OpenedProjectBase, DesignerState } from '../common/designer-types';
import { Table } from '../common/types';
export { UpdateProjectNotification, SetNameProjectNotification } from '../../../../shared/project-manager';

export const enum ActionTypes {
  SET_NOTIFIER = 'core-designer/set-notifier',
  CLEAR_ALL_NOTIFIERS = 'core-designer/clear-all-notifiers',
  REMOVE_OPENED_PROJECT = 'core-designer/remove-opened-project',
  UPDATE_PROJECT = 'core-designer/update-project',

  MOVE_COMPONENT = 'core-designer/move-component', // TODO: remove
}

export { DesignerTabActionData, PluginUsage, Member, ConfigItem, MemberType, ConfigType };

export interface Plugin extends CorePluginData {
  id: string;

  stateIds: string[]; // ordered alphabetically
  actionIds: string[]; // ordered alphabetically
  configIds: string[]; // ordered alphabetically
}

export interface Binding extends CoreBindingData {
  id: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Component extends CoreComponentData {
  id: string;
}

export interface CoreOpenedProject extends OpenedProjectBase {
  plugins: Table<Plugin>;
  components: Table<Component>;
  bindings: Table<Binding>;
}

export type CoreDesignerState = DesignerState<CoreOpenedProject>;

// TODO: remove that
export interface MoveComponentAction {
  tabId: string;
  componentId: string;
  position: Position;
}
