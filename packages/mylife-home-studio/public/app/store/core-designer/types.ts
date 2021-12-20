import { PluginUsage, Member, ConfigItem, MemberType, ConfigType } from '../../../../shared/component-model';
import { CoreBindingData, CoreComponentData, coreImportData, CorePluginData, ImportFromOnlineConfig, ImportFromProjectConfig, BulkUpdatesStats, coreValidation, DeployChanges } from '../../../../shared/project-manager';
import { DesignerTabActionData, OpenedProjectBase, DesignerState } from '../common/designer-types';
import { Table } from '../common/types';

export { CoreToolboxDisplay, UpdateProjectNotification, SetNameProjectNotification } from '../../../../shared/project-manager';

export const enum ActionTypes {
  SET_NOTIFIER = 'core-designer/set-notifier',
  CLEAR_ALL_NOTIFIERS = 'core-designer/clear-all-notifiers',
  REMOVE_OPENED_PROJECT = 'core-designer/remove-opened-project',
  UPDATE_PROJECT = 'core-designer/update-project',

  PREPARE_IMPORT_FROM_ONLINE = 'core-designer/prepare-import-from-online',
  PREPARE_IMPORT_FROM_PROJECT = 'core-designer/prepare-import-from-project',
  APPLY_BULK_UPDATES = 'core-designer/apply-bulk-updates',
  VALIDATE_PROJECT = 'core-designer/validate-project',
  PREPARE_DEPLOY_TO_FILES = 'core-designer/prepare-deploy-to-files',
  APPLY_DEPLOY_TO_FILES = 'core-designer/apply-deploy-to-files',
  PREPARE_DEPLOY_TO_ONLINE = 'core-designer/prepare-deploy-to-online',
  APPLY_DEPLOY_TO_ONLINE = 'core-designer/apply-deploy-to-online',
  SET_COMPONENT = 'core-designer/set-component',
  MOVE_COMPONENTS = 'core-designer/move-components',
  CONFIGURE_COMPONENT = 'core-designer/configure-component',
  RENAME_COMPONENT = 'core-designer/rename-component',
  CLEAR_COMPONENTS = 'core-designer/clear-components',
  SET_BINDING = 'core-designer/set-binding',
  CLEAR_BINDING = 'core-designer/clear-binding',
  UPDATE_TOOLBOX = 'core-designer/update-toolbox',
}

export { DesignerTabActionData, PluginUsage, Member, ConfigItem, MemberType, ConfigType, CoreBindingData, ImportFromOnlineConfig, ImportFromProjectConfig, BulkUpdatesStats, coreValidation, coreImportData, DeployChanges };

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
  changes: coreImportData.ObjectChange[];
  serverData: unknown;
}

export interface OnlineDeployData {
  validation: coreValidation.Item[];
  changes: DeployChanges;
  serverData: unknown;
}

export interface FilesDeployData {
  validation: coreValidation.Item[];
  changes: DeployChanges; // only adds
  files: string[];
  bindingsInstanceName: {
    actual: string;
    needed: boolean;
  };
  serverData: unknown;
}

export interface FilesDeployResult {
  writtenFilesCount: number;
}