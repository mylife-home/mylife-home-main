import { Window, Control, DefaultWindow, Definition, DefinitionResource } from './ui-model';
import { BindingConfig } from './core-model';
import { Component, Plugin, PluginUsage } from './component-model';

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * Ui project model
 */

export interface UiProject {
  //name: string;
  definition: Definition;
  componentData: UiComponentData;
}

export interface UiComponentData {
  components: Component[]; // plugin points to plugin instanceName:module.name
  plugins: { [id: string]: UiPluginData; }; // id: instanceName:module.name
}

export interface UiPluginData extends Omit<Plugin, 'usage' | 'config'> {
  instanceName: string;
}

/**
 * Core project model
 */
export interface CoreProject extends CoreView {
  plugins: { [id: string]: CorePluginData; }; // id: instanceName:module.name
  templates: { [id: string]: CoreTemplate; };
}

export interface CoreView {
  components: { [id: string]: CoreComponentData; };
  bindings: { [id: string]: CoreBindingData; }; // id = sourceId:sourceState:targetId:targetAction
}

export interface CoreTemplate extends CoreView {
  exports: CoreTemplateExports;
}

export interface CoreTemplateExports {
  config: { [id: string]: CoreTemplateConfigExport },
  members: { [id: string]: CoreTemplateMemberExport }
}

export interface CoreTemplateConfigExport {
  component: string;
  configName: string;
}

export interface CoreTemplateMemberExport {
  component: string;
  member: string;
}

export type CoreBindingData = Mutable<BindingConfig>;

export type CoreComponentDefinitionType = 'plugin' | 'template';

export interface CoreComponentDefinition {
  type: CoreComponentDefinitionType;
  // plugin points to plugin instanceName:module.name
  id: string;
}

export type CoreComponentConfiguration = { [name: string]: any; };

export interface CoreComponentData extends Omit<Component, 'id' | 'plugin'> {
  definition: CoreComponentDefinition;
  position: { x: number; y: number; };
  config: CoreComponentConfiguration;
  external: boolean;
}

export type CoreToolboxDisplay = 'show' | 'hide';

export interface CorePluginData extends Plugin {
  instanceName: string;
  toolboxDisplay: CoreToolboxDisplay;
}

/**
 * Project list notifications
 */

export type ProjectType = 'ui' | 'core';

export interface UpdateListNotification {
  operation: 'set' | 'clear' | 'rename';
  type: ProjectType;
  name: string;
}

export interface SetListNotification extends UpdateListNotification {
  operation: 'set';
  info: ProjectInfo;
}

export interface ClearListNotification extends UpdateListNotification {
  operation: 'clear';
}

export interface RenameListNotification extends UpdateListNotification {
  operation: 'rename';
  newName: string;
}

export interface ProjectInfo {
}

export interface UiProjectInfo extends ProjectInfo {
  windowsCount: number;
  resourcesCount: number;
  resourcesSize: number;
  componentsCount: number;
}

export interface CoreProjectInfo extends ProjectInfo {
  instancesCount: number;
  pluginsCount: number;
  templatesCount: number;
  componentsCounts: { [usage in PluginUsage]: number };
  bindingsCount: number;
}

/**
 * Project update notifications
 */

export interface UpdateProjectNotification {
  operation: 'set-name' | 'reset'
  | 'set-ui-default-window' | 'set-ui-component-data' | 'set-ui-resource' | 'clear-ui-resource' | 'rename-ui-resource' | 'set-ui-window' | 'clear-ui-window' | 'rename-ui-window'
  | 'set-core-plugins' | 'set-core-plugin-toolbox-display' | 'set-core-plugin' | 'clear-core-plugin' | 'set-core-component' | 'clear-core-component' | 'rename-core-component' | 'set-core-binding' | 'clear-core-binding' | 'set-core-template' | 'clear-core-template' | 'rename-core-template';
}

export interface SetNameProjectNotification extends UpdateProjectNotification {
  operation: 'set-name';
  name: string;
}

export interface ResetProjectNotification extends UpdateProjectNotification {
  operation: 'reset';
}

/**
 * Ui Project update notifications
 */

export interface SetUiDefaultWindowNotification extends UpdateProjectNotification {
  operation: 'set-ui-default-window';
  defaultWindow: DefaultWindow;
}

export interface SetUiComponentDataNotification extends UpdateProjectNotification {
  operation: 'set-ui-component-data';
  componentData: UiComponentData;
}

export interface SetUiResourceNotification extends UpdateProjectNotification {
  operation: 'set-ui-resource';
  resource: DefinitionResource;
}

export interface ClearUiResourceNotification extends UpdateProjectNotification {
  operation: 'clear-ui-resource';
  id: string;
}

export interface RenameUiResourceNotification extends UpdateProjectNotification {
  operation: 'rename-ui-resource';
  id: string;
  newId: string;
}

export interface SetUiWindowNotification extends UpdateProjectNotification {
  operation: 'set-ui-window';
  window: Window;
}

export interface ClearUiWindowNotification extends UpdateProjectNotification {
  operation: 'clear-ui-window';
  id: string;
}

export interface RenameUiWindowNotification extends UpdateProjectNotification {
  operation: 'rename-ui-window';
  id: string;
  newId: string;
}

/**
 * Core Project update notifications
 */

export interface SetCorePluginsNotification extends UpdateProjectNotification {
  operation: 'set-core-plugins';
  plugins: { [id: string]: CorePluginData; };
}

export interface SetCorePluginToolboxDisplayNotification extends UpdateProjectNotification {
  operation: 'set-core-plugin-toolbox-display';
  id: string;
  display: CoreToolboxDisplay;
}

export interface SetCorePluginNotification extends UpdateProjectNotification {
  operation: 'set-core-plugin';
  id: string;
  plugin: CorePluginData;
}
export interface ClearCorePluginNotification extends UpdateProjectNotification {
  operation: 'clear-core-plugin';
  id: string;
}

export interface SetCoreComponentNotification extends UpdateProjectNotification {
  operation: 'set-core-component';
  templateId: string; // null if no template
  id: string;
  component: CoreComponentData;
}

export interface ClearCoreComponentNotification extends UpdateProjectNotification {
  operation: 'clear-core-component';
  templateId: string; // null if no template
  id: string;
}

export interface RenameCoreComponentNotification extends UpdateProjectNotification {
  operation: 'rename-core-component';
  templateId: string; // null if no template
  id: string;
  newId: string;
}

export interface SetCoreBindingNotification extends UpdateProjectNotification {
  operation: 'set-core-binding';
  templateId: string; // null if no template
  id: string;
  binding: CoreBindingData;
}

export interface ClearCoreBindingNotification extends UpdateProjectNotification {
  operation: 'clear-core-binding';
  templateId: string; // null if no template
  id: string;
}

export interface SetCoreTemplateNotification extends UpdateProjectNotification {
  operation: 'set-core-template';
  id: string;
  exports: CoreTemplateExports;
}

export interface ClearCoreTemplateNotification extends UpdateProjectNotification {
  operation: 'clear-core-template';
  id: string;
}

export interface RenameCoreTemplateNotification extends UpdateProjectNotification {
  operation: 'rename-core-template';
  id: string;
  newId: string;
}

/**
 * Project calls
 */

export interface ProjectCall {
}

export interface ProjectCallResult {
}

/**
 * Ui Project calls
 */

export interface UiProjectCall {
  operation: 'validate' | 'refresh-components-from-online' | 'refresh-components-from-project' | 'apply-refresh-components' | 'deploy' | 'set-default-window'
  | 'set-resource' | 'clear-resource' | 'rename-resource'
  | 'new-window' | 'clear-window' | 'rename-window' | 'clone-window' | 'set-window-properties'
  | 'new-control' | 'clear-control' | 'rename-control' | 'clone-control' | 'set-control-properties';
}

export interface UiValidationError {
  path: UiElementPath;
  message: string;
}

export type UiElementPath = UiElementPathNode[];

export interface UiElementPathNode {
  type: string;
  id: string;
}

export interface ValidateUiProjectCallResult extends ProjectCallResult {
  errors: UiValidationError[];
}

export interface UiBreakingOperation {
  operation: 'update' | 'remove';
  componentId: string;
  usage: UiElementPath[];
}

export interface RefreshComponentsUiProjectCallResult extends ProjectCallResult {
  breakingOperations: UiBreakingOperation[];
  serverData: unknown;
}

export interface ApplyRefreshComponentsUiProjectCall extends UiProjectCall {
  operation: 'apply-refresh-components';
  serverData: unknown;
}

export interface RefreshComponentsFromProjectUiProjectCall extends UiProjectCall {
  operation: 'refresh-components-from-project';
  projectId: string;
}

export interface DeployUiProjectCallResult extends ProjectCallResult {
  validationErrors?: UiValidationError[];
  deployError?: string;
}

export interface SetDefaultWindowUiProjectCall extends UiProjectCall {
  operation: 'set-default-window';
  defaultWindow: DefaultWindow;
}

export interface SetResourceUiProjectCall extends UiProjectCall {
  operation: 'set-resource';
  resource: DefinitionResource;
}

export interface ClearResourceUiProjectCall extends UiProjectCall {
  operation: 'clear-resource';
  id: string;
}

export interface RenameResourceUiProjectCall extends UiProjectCall {
  operation: 'rename-resource';
  id: string;
  newId: string;
}

export interface NewWindowUiProjectCall extends UiProjectCall {
  operation: 'new-window';
  id: string;
}

export interface ClearWindowUiProjectCall extends UiProjectCall {
  operation: 'clear-window';
  id: string;
}

export interface RenameWindowUiProjectCall extends UiProjectCall {
  operation: 'rename-window';
  id: string;
  newId: string;
}

export interface CloneWindowUiProjectCall extends UiProjectCall {
  operation: 'clone-window';
  id: string;
  newId: string;
}

export interface SetWindowPropertiesUiProjectCall extends UiProjectCall {
  operation: 'set-window-properties';
  id: string;
  properties: Partial<Omit<Window, 'id' | 'controls'>>;
}

export interface NewControlUiProjectCall extends UiProjectCall {
  operation: 'new-control';
  windowId: string;
  id: string;
  x: number;
  y: number;
}

export interface ClearControlUiProjectCall extends UiProjectCall {
  operation: 'clear-control';
  windowId: string;
  id: string;
}

export interface RenameControlUiProjectCall extends UiProjectCall {
  operation: 'rename-control';
  windowId: string;
  id: string;
  newId: string;
}

export interface CloneControlUiProjectCall extends UiProjectCall {
  operation: 'clone-control';
  windowId: string;
  id: string;
  newId: string;
}

export interface SetControlPropertiesUiProjectCall extends UiProjectCall {
  operation: 'set-control-properties';
  windowId: string;
  id: string;
  properties: Partial<Omit<Control, 'id'>>;
}

/**
 * Core Project calls
 */

export interface CoreProjectCall {
  operation: 'update-toolbox'
  | 'set-template' | 'clear-template' | 'rename-template' | 'set-template-export' | 'clear-template-export'
  | 'set-component'| 'move-components' | 'configure-component' | 'rename-component' | 'clear-components' | 'copy-components-to-template'
  | 'set-binding' | 'clear-binding'
  | 'prepare-import-from-online' | 'prepare-import-from-project' | 'apply-bulk-updates'
  | 'validate'
  | 'prepare-deploy-to-files' | 'apply-deploy-to-files' | 'prepare-deploy-to-online' | 'apply-deploy-to-online';
}

export interface UpdateToolboxCoreProjectCall extends CoreProjectCall {
  operation: 'update-toolbox';
  itemType: 'instance' | 'plugin';
  itemId: string;
  action: 'show' | 'hide' | 'delete'
}

export interface SetTemplateCoreProjectCall extends CoreProjectCall {
  operation: 'set-template';
  templateId: string;
}

export interface RenameTemplateCoreProjectCall extends CoreProjectCall {
  operation: 'rename-template';
  templateId: string;
  newId: string;
}

export interface ClearTemplateCoreProjectCall extends CoreProjectCall {
  operation: 'clear-template';
  templateId: string;
}

export interface SetTemplateExportCoreProjectCall extends CoreProjectCall {
  operation: 'set-template-export';
  templateId: string;
  exportType: 'config' | 'member';
  exportId: string;
  componentId: string;
  propertyName: string; // config or member
}

export interface ClearTemplateExportCoreProjectCall extends CoreProjectCall {
  operation: 'clear-template-export';
  templateId: string;
  exportType: 'config' | 'member';
  exportId: string;
}

export interface SetComponentCoreProjectCall extends CoreProjectCall {
  operation: 'set-component';
  templateId: string;
  componentId: string;
  definition: CoreComponentDefinition;
  x: number;
  y: number;
}

export interface MoveComponentsCoreProjectCall extends CoreProjectCall {
  operation: 'move-components';
  templateId: string;
  componentsIds: string[];
  delta: { x: number; y: number };
}

export interface ConfigureComponentCoreProjectCall extends CoreProjectCall {
  operation: 'configure-component';
  templateId: string;
  componentId: string;
  configId: string;
  configValue: any;
}

export interface RenameComponentCoreProjectCall extends CoreProjectCall {
  operation: 'rename-component';
  templateId: string;
  componentId: string;
  newId: string;
}

export interface ClearComponentsCoreProjectCall extends CoreProjectCall {
  operation: 'clear-components';
  templateId: string;
  componentsIds: string[];
}

export interface CopyComponentsToTemplateCoreProjectCall extends CoreProjectCall {
  operation: 'copy-components-to-template';
  templateId: string;
  componentsIds: string[];
  targetTemplateId: string;
}

export interface CopyComponentsStats {
  components: number;
  bindings: number;
}

export interface CopyComponentsCoreProjectCallResult extends ProjectCallResult {
  stats: CopyComponentsStats;
};

export interface SetBindingCoreProjectCall extends CoreProjectCall {
  operation: 'set-binding';
  templateId: string;
  binding: CoreBindingData;
}

export interface ClearBindingCoreProjectCall extends CoreProjectCall {
  operation: 'clear-binding';
  templateId: string;
  bindingId: string;
}

export namespace coreImportData {

  export type ChangeType = 'add' | 'update' | 'delete';
  export type ObjectType = 'component' | 'plugin' | 'template';
  
  export interface ObjectChange {
    key: string; // for selection
    id: string; // component/plugin/template id
    changeType: ChangeType;
    objectType: ObjectType;
    dependencies: string[]; // components changes may depends on plugins changes
    impacts: Impact[];
  }

  export interface PluginChange extends ObjectChange {
    objectType: 'plugin';
    instanceName: string;

    version: { before: string; after: string; };
    usage: PluginUsage; // or null if no change
    config: { [name: string]: ChangeType; };
    members: { [name: string]: ChangeType; };
  }

  /**
   * @note component changes are always on project directly, not inside templates
   */
  export interface ComponentChange extends ObjectChange {
    objectType: 'component';
    instanceName: string;

    config: { [name: string]: { type: ChangeType; value: any; }; };
    external: boolean; // or null if no change
    pluginId: string; // or null if no change
  }

  /**
   * @note used on exports removes, to apply the impact analysis on the changes
   */
   export interface TemplateChange extends ObjectChange {
    objectType: 'template';

    // templates changes are only export deletion
    exportType: 'config' | 'member';
    exportId: string;
  }

  export interface Impact {
    type: 'binding-delete' | 'component-delete' | 'component-config' | 'template-export';
    templateId: string;
  }

  export interface BindingDeleteImpact extends Impact {
    type: 'binding-delete';
    bindingId: string;
  }

  export interface ComponentDeleteImpact extends Impact {
    type: 'component-delete';
    componentId: string;
  }

  export interface ComponentConfigImpact extends Impact {
    type: 'component-config';
    componentId: string;
    config: { [name: string]: ChangeType; }; // update = reset
  }

  export interface TemplateExportImpact extends Impact {
    type: 'template-export';
    configExportDeletes: string[];
    memberExportDeletes: string[];
  }
}

export interface ImportFromOnlineConfig {
  importPlugins: boolean;
  importComponents: boolean; // always external, config is not published online
}

export interface PrepareImportFromOnlineCoreProjectCall extends CoreProjectCall {
  operation: 'prepare-import-from-online';
  config: ImportFromOnlineConfig;
}

type ComponentsImportType = null | 'standard' | 'external';

export interface ImportFromProjectConfig {
  importPlugins: boolean;
  importComponents: ComponentsImportType;
  projectId: string;
}

export interface PrepareImportFromProjectCoreProjectCall extends CoreProjectCall {
  operation: 'prepare-import-from-project';
  config: ImportFromProjectConfig;
}

export interface PrepareBulkUpdatesCoreProjectCallResult extends ProjectCallResult {
  changes: coreImportData.ObjectChange[];
  serverData: unknown;
}

export interface ApplyBulkUpdatesCoreProject extends CoreProjectCall {
  operation: 'apply-bulk-updates';
  selection: string[];
  serverData: unknown;
}

export interface BulkUpdatesStats {
  plugins: number;
  components: number;
  templates: number;
  bindings: number;
}

export interface ApplyBulkUpdatesCoreProjectCallResult extends ProjectCallResult {
  stats: BulkUpdatesStats;
};

export namespace coreValidation {
  export type ChangeType = 'add' | 'update' | 'delete';
  export type ItemType = 'plugin-changed' | 'existing-component-id' | 'bad-external-component' | 'invalid-binding-api' | 'component-bad-config' | 'binding-mismatch';
  export type Severity = 'info' | 'warning' | 'error';
  
  export interface Item {
    type: ItemType;
    severity: Severity;
  }

  export interface PluginChanged extends Item {
    type: 'plugin-changed';

    instanceName: string;
    module: string;
    name: string;
  
    changeType: ChangeType; // update or delete only
    config: { [name: string]: ChangeType; },
    members: { [name: string]: ChangeType; },
    impacts: string[]; // list of impacted components
  }

  export interface ExistingComponentId extends Item {
    type: 'existing-component-id';
    
    componentId: string;
    project: {
      instanceName: string;
      module: string;
      name: string;
    };
    existing: {
      instanceName: string;
      module: string;
      name: string;
    };
  }

  export interface BadExternalComponent extends Item {
    // may be only severity:info if plugin has same members
    // if existing is empty then it's missing
    type: 'bad-external-component';

    componentId: string;
    project: {
      instanceName: string;
      module: string;
      name: string;
      version: string;
    };
    existing: {
      instanceName: string;
      module: string;
      name: string;
      version: string;
    };
  }

  export interface InvalidBindingApi extends Item {
    type: 'invalid-binding-api';

    instanceNames: string[]; // error if none or multiple
  }

  export interface ComponentBadConfig extends Item {
    type: 'component-bad-config';

    componentId: string;
    instanceName: string;
    module: string;
    name: string;
    config: { [name: string]: string; };
  }

  export interface BindingMismatch extends Item {
    type: 'binding-mismatch';

    sourceComponent: string;
    sourceState: string;
    sourceType: string; // null = does not exist
    targetComponent: string;
    targetAction: string;
    targetType: string; // null = does not exist
  }
}

export interface ValidateCoreProjectCallResult extends ProjectCallResult {
  validation: coreValidation.Item[];
}

export interface DeployChanges {
  components: ComponentDeployChange[];
  bindings: BindingDeployChange[];
}

export type ChangeType = 'add' | 'update' | 'delete';

export interface ComponentDeployChange {
  type: ChangeType;
  instanceName: string;
  componentId: string;
}

export interface BindingDeployChange {
  type: ChangeType; // no update
  instanceName: string; // may be null for files deploy if binding instance could not be deduced
  bindingId: string;
}

export interface PrepareDeployToFilesCoreProjectCallResult extends ProjectCallResult {
  validation: coreValidation.Item[];
  changes: DeployChanges; // only adds
  files: string[];
  bindingsInstanceName: {
    actual: string; // null if could not deduce
    needed: boolean;
  };
  serverData: unknown;
}

export interface ApplyDeployToFilesCoreProjectCall extends CoreProjectCall {
  operation: 'apply-deploy-to-files';
  bindingsInstanceName?: string;
  serverData: unknown;
}

export interface ApplyDeployToFilesCoreProjectCallResult extends ProjectCallResult {
  writtenFilesCount: number;
}

export interface PrepareDeployToOnlineCoreProjectCallResult extends ProjectCallResult {
  validation: coreValidation.Item[];
  changes: DeployChanges;
  serverData: unknown;
}

export interface ApplyDeployToOnlineCoreProjectCall extends CoreProjectCall {
  operation: 'apply-deploy-to-online';
  serverData: unknown;
}
