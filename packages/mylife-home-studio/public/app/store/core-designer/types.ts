import { PluginUsage, Member, ConfigItem, MemberType, ConfigType } from '../../../../shared/component-model';
import { CoreBindingData, CoreComponentData, coreImportData, CorePluginData, DeployChange, ImportFromProjectConfig } from '../../../../shared/project-manager';
import { DesignerTabActionData, OpenedProjectBase, DesignerState } from '../common/designer-types';
import { Table } from '../common/types';

export { CoreToolboxDisplay, UpdateProjectNotification, SetNameProjectNotification } from '../../../../shared/project-manager';

export const enum ActionTypes {
  SET_NOTIFIER = 'core-designer/set-notifier',
  CLEAR_ALL_NOTIFIERS = 'core-designer/clear-all-notifiers',
  REMOVE_OPENED_PROJECT = 'core-designer/remove-opened-project',
  UPDATE_PROJECT = 'core-designer/update-project',

  PREPARE_REFRESH_TOOLBOX_FROM_ONLINE = 'core-designer/prepare-refresh-toolbox-from-online',
  PREPARE_IMPORT_FROM_PROJECT = 'core-designer/prepare-import-from-project',
  APPLY_BULK_UPDATES = 'core-designer/apply-bulk-updates',
  DEPLOY_TO_FILES = 'core-designer/deploy-to-files',
  PREPARE_DEPLOY_TO_ONLINE = 'core-designer/prepare-deploy-to-online',
  APPLY_DEPLOY_TO_ONLINE = 'core-designer/apply-deploy-to-online',
  SET_COMPONENT = 'core-designer/set-component',
  MOVE_COMPONENT = 'core-designer/move-component',
  CONFIGURE_COMPONENT = 'core-designer/configure-component',
  RENAME_COMPONENT = 'core-designer/rename-component',
  CLEAR_COMPONENT = 'core-designer/clear-component',
  SET_BINDING = 'core-designer/set-binding',
  CLEAR_BINDING = 'core-designer/clear-binding',
  UPDATE_TOOLBOX = 'core-designer/update-toolbox',
}

export { DesignerTabActionData, PluginUsage, Member, ConfigItem, MemberType, ConfigType, CoreBindingData, ImportFromProjectConfig };

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

export interface BulkUpdatesData {
  changes: coreImportData.Changes;
  serverData: unknown;
}

export interface DeployData {
  changes: DeployChange[];
  serverData: unknown;
}