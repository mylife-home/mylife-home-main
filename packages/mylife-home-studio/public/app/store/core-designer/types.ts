import { PluginUsage, Member, ConfigItem, MemberType, ConfigType } from '../../../../shared/component-model';
import { CoreBindingData, CoreComponentData, coreImportData, CorePluginData, ImportFromOnlineConfig, ImportFromProjectConfig, BulkUpdatesStats, coreValidation, DeployChanges, CoreTemplateExports, CoreTemplateConfigExport, CoreTemplateMemberExport, UpdateProjectNotification, CoreComponentDefinition, CoreComponentDefinitionType } from '../../../../shared/project-manager';
import { DesignerTabActionData, OpenedProjectBase } from '../common/designer-types';
import { Table } from '../common/types';

export { CoreToolboxDisplay, SetNameProjectNotification } from '../../../../shared/project-manager';

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
  SET_TEMPLATE = 'core-designer/set-template',
  RENAME_TEMPLATE = 'core-designer/rename-template',
  CLEAR_TEMPLATE = 'core-designer/clear-template',
  SET_TEMPLATE_EXPORT = 'core-designer/set-template-export',
  CLEAR_TEMPLATE_EXPORT = 'core-designer/clear-template-export',
  SET_COMPONENT = 'core-designer/set-component',
  MOVE_COMPONENTS = 'core-designer/move-components',
  CONFIGURE_COMPONENT = 'core-designer/configure-component',
  RENAME_COMPONENT = 'core-designer/rename-component',
  CLEAR_COMPONENTS = 'core-designer/clear-components',
  SET_BINDING = 'core-designer/set-binding',
  CLEAR_BINDING = 'core-designer/clear-binding',
  UPDATE_TOOLBOX = 'core-designer/update-toolbox',
  ACTIVATE_VIEW = 'core-designer/activate-view',
  SELECT = 'core-designer/select',
  TOGGLE_COMPONENT_SELECTION = 'core-designer/toggle-compomnent-selection',
}

export namespace ActionPayloads {

  export type SetNotifier = { tabId: string; notifierId: string; };
  export type ClearAllNotifiers = void;
  export type RemoveOpenedProject = { tabId: string; };
  export type UpdateProject = { tabId: string; update: UpdateProjectNotification }[];

  export type PrepareImportFromProject = { tabId: string; config: ImportFromProjectConfig };
  export type PrepareImportFromOnline = { tabId: string; config: ImportFromOnlineConfig };
  export type ApplyBulkUpdates = { tabId: string; selection: string[]; serverData: unknown; };
  export type ValidateProject = { tabId: string; };
  export type PrepareDeployToFiles = { tabId: string; };
  export type ApplyDeployToFiles = { tabId: string; bindingsInstanceName?: string; serverData: unknown; };
  export type PrepareDeployToOnline = { tabId: string; };
  export type ApplyDeployToOnline = { tabId: string; serverData: unknown; };
  export type ActivateView = { tabId: string; templateId: string; };
  export type Select = { tabId: string; selection: Selection; };
  export type ToggleComponentSelection = { tabId: string; componentId: string; };

  export type SetComponent = { templateId: string; componentId: string; definition: ComponentDefinition; position: Position; }; // tabId is deduced from plugin
  export type MoveComponents = { componentsIds: string[]; delta: Position; };
  export type ConfigureComponent = { componentId: string; configId: string; configValue: any };
  export type RenameComponent = { componentId: string; newId: string };
  export type ClearComponents = { componentsIds: string[]; };
  export type SetTemplate = { tabId: string; templateId: string; };
  export type RenameTemplate = { templateId: string; newId: string };
  export type ClearTemplate = { templateId: string; };
  export type SetTemplateExport = { exportType: 'config' | 'member'; exportId: string; componentId: string; propertyName: string; }; // tabId and templateId are deduced from componentId
  export type ClearTemplateExport = { templateId: string; exportType: 'config' | 'member'; exportId: string };
  export type SetBinding = { binding: CoreBindingData; }; // tabId and templateId are deduced from components
  export type ClearBinding = { bindingId: string; };
  export type UpdateToolbox = { itemType: 'instance' | 'plugin'; itemId: string; action: 'show' | 'hide' | 'delete' };
}

export type TemplateExports = CoreTemplateExports;
export type TemplateConfigExport = CoreTemplateConfigExport;
export type TemplateMemberExport = CoreTemplateMemberExport;

export { DesignerTabActionData, PluginUsage, Member, ConfigItem, MemberType, ConfigType, CoreBindingData, ImportFromOnlineConfig, ImportFromProjectConfig, BulkUpdatesStats, coreValidation, coreImportData, DeployChanges, UpdateProjectNotification };

export type Use = 'unused' | 'external' | 'used';

export interface ComponentDefinitionStats {
  use: Use;
  components: 0;
  externalComponents: 0;
}

export interface InstanceStats extends ComponentDefinitionStats {
  plugins: number;
  hasHidden: boolean;
  hasShown: boolean;
}

export type ComponentDefinitionType = CoreComponentDefinitionType;
export type ComponentDefinition = CoreComponentDefinition;

export interface Instance {
  id: string;
  instanceName: string;
  plugins: string[];
}

export interface Plugin extends Omit<CorePluginData, 'instanceName'> {
  id: string;
  instance: string; // instance ID
  usageComponents: string[]; // components using this plugin
}

export interface Binding extends CoreBindingData {
  id: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Component extends CoreComponentData {
  // plugin points to store plugin id: `projectId:instanceName:module.name`
  id: string;
  componentId: string;
  bindings: { [memberName: string]: string[]; };
}

export type SelectionType = 'components' | 'binding';

export interface Selection {
  type: SelectionType;
}

export interface BindingSelection extends Selection {
  type: 'binding';
  id: string;
}

export type MultiSelectionIds = { [id: string]: true };

export interface ComponentsSelection extends Selection {
  type: 'components';
  ids: MultiSelectionIds;
}

export interface CoreOpenedProject extends OpenedProjectBase, View {
  instances: string[];
  plugins: string[];
  templates: string[];

  activeTemplate: string; // null if main view is active
  viewSelection: Selection; // selection on the view
}

export interface Template extends View {
  id: string;
  templateId: string;
  exports: TemplateExports;

  usageComponents: string[]; // components using this template
}

export interface CoreDesignerState {
  openedProjects: Table<CoreOpenedProject>;
  instances: Table<Instance>;
  plugins: Table<Plugin>;
  templates: Table<Template>;
  components: Table<Component>;
  bindings: Table<Binding>;
}

export interface View {
  components: string[];
  bindings: string[];
}

export interface ComponentDefinitionProperties {
  readonly stateIds: string[];
  readonly actionIds: string[];
  readonly configIds: string[];

  readonly members: { [name: string]: Member };
  readonly config: { [name: string]: ConfigItem; };
}

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
