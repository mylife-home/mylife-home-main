import { PluginUsage, Member, ConfigItem, MemberType, ConfigType } from '../../../../shared/component-model';
import { CoreBindingData, CoreComponentData, CorePluginData } from '../../../../shared/project-manager';
import { DesignerTabActionData, OpenedProjectBase, DesignerState } from '../common/designer-types';
import { Table } from '../common/types';
export { CoreToolboxDisplay, UpdateProjectNotification, SetNameProjectNotification } from '../../../../shared/project-manager';

export const enum ActionTypes {
  SET_NOTIFIER = 'core-designer/set-notifier',
  CLEAR_ALL_NOTIFIERS = 'core-designer/clear-all-notifiers',
  REMOVE_OPENED_PROJECT = 'core-designer/remove-opened-project',
  UPDATE_PROJECT = 'core-designer/update-project',

  MOVE_COMPONENT = 'core-designer/move-component', // TODO: remove
  RENAME_COMPONENT = 'core-designer/rename-component',
  CLEAR_COMPONENT = 'core-designer/clear-component',
  CLEAR_BINDING = 'core-designer/clear-binding',
  UPDATE_TOOLBOX = 'core-designer/update-toolbox',
}

export { DesignerTabActionData, PluginUsage, Member, ConfigItem, MemberType, ConfigType };

export type PluginUse = 'unused' | 'external' | 'used';

export interface Instance {
  id: string;
  plugins: string[];

  use: PluginUse;
  hasShown: boolean;
  hasHidden: boolean;
}

export interface Plugin extends CorePluginData {
  id: string;

  stateIds: string[]; // ordered alphabetically
  actionIds: string[]; // ordered alphabetically
  configIds: string[]; // ordered alphabetically

  use: PluginUse;
  components: string[];
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
  bindings: { [memberName: string]: string[]; };
}

export interface CoreOpenedProject extends OpenedProjectBase {
  instances: Table<Instance>;
  plugins: Table<Plugin>;
  components: Table<Component>;
  bindings: Table<Binding>;
}

export type CoreDesignerState = DesignerState<CoreOpenedProject>;
