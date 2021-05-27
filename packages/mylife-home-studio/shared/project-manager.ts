import { Window, DefaultWindow, Definition, DefinitionResource } from './ui-model';
import { Component, Plugin, PluginUsage } from './component-model';

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

export interface CoreProject {
  //name: string;
  components: { [id: string]: CoreComponentData; };
  plugins: { [id: string]: CorePluginData; }; // id: instanceName:module.name
  bindings: { [id: string]: CoreBindingData; }; // id = sourceId:sourceState:targetId:targetAction
  // bindings instance ?
}

export interface CoreComponentData extends Omit<Component, 'id'> {
  // plugin points to plugin instanceName:module.name
  position: { x: number; y: number; };
  config: { [name: string]: any; };
  external: boolean;
}

export type CoreToolboxDisplay = 'show' | 'hide';

export interface CorePluginData extends Plugin {
  instanceName: string;
  toolboxDisplay: CoreToolboxDisplay;
}

// should we merge with core/store?
export interface CoreBindingData {
  sourceComponent: string;
  sourceState: string;
  targetComponent: string;
  targetAction: string;
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
  componentsCounts: { [usage in PluginUsage]: number };
  pluginsCount: number;
  bindingsCount: number;
}

/**
 * Project update notifications
 */

export interface UpdateProjectNotification {
  operation: 'set-name' | 'reset'
  | 'set-ui-default-window' | 'set-ui-component-data' | 'set-ui-resource' | 'clear-ui-resource' | 'rename-ui-resource' | 'set-ui-window' | 'clear-ui-window' | 'rename-ui-window'
  | 'set-core-plugins' | 'set-core-plugin-toolbox-display' | 'clear-core-plugin' | 'set-core-component' | 'clear-core-component' | 'rename-core-component' | 'set-core-binding' | 'clear-core-binding';
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

export interface ClearCorePluginNotification extends UpdateProjectNotification {
  operation: 'clear-core-plugin';
  id: string;
}

export interface SetCoreComponentNotification extends UpdateProjectNotification {
  operation: 'set-core-component';
  id: string;
  component: CoreComponentData;
}

export interface ClearCoreComponentNotification extends UpdateProjectNotification {
  operation: 'clear-core-component';
  id: string;
}

export interface RenameCoreComponentNotification extends UpdateProjectNotification {
  operation: 'rename-core-component';
  id: string;
  newId: string;
}

export interface SetCoreBindingNotification extends UpdateProjectNotification {
  operation: 'set-core-binding';
  id: string;
  binding: CoreBindingData;
}

export interface ClearCoreBindingNotification extends UpdateProjectNotification {
  operation: 'clear-core-binding';
  id: string;
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
  operation: 'validate' | 'refresh-components-from-online' | 'refresh-components-from-project' | 'apply-refresh-components' | 'deploy' | 'set-default-window' | 'set-resource' | 'clear-resource' | 'rename-resource' | 'set-window' | 'clear-window' | 'rename-window';
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

export interface SetWindowUiProjectCall extends UiProjectCall {
  operation: 'set-window';
  window: Window;
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

/**
 * Core Project calls
 */

export interface CoreProjectCall {
  operation: 'update-toolbox' | 'set-component' | 'move-component' | 'configure-component' | 'rename-component' | 'clear-component' | 'set-binding' | 'clear-binding'
  | 'prepare-refresh-toolbox-from-files' | 'prepare-refresh-toolbox-from-online' | 'apply-refresh-toolbox' | 'deploy-to-files' | 'prepare-deploy-to-online' | 'apply-deploy-to-online';
}

export interface UpdateToolboxCoreProjectCall extends CoreProjectCall {
  operation: 'update-toolbox';
  itemType: 'instance' | 'plugin';
  itemId: string;
  action: 'show' | 'hide' | 'delete'
}

export interface SetComponentCoreProjectCall extends CoreProjectCall {
  operation: 'set-component';
  componentId: string;
  pluginId: string;
  x: number;
  y: number;
}

export interface MoveComponentCoreProjectCall extends CoreProjectCall {
  operation: 'move-component';
  componentId: string;
  x: number;
  y: number;
}

export interface ConfigureComponentCoreProjectCall extends CoreProjectCall {
  operation: 'configure-component';
  componentId: string;
  configId: string;
  configValue: any;
}

export interface RenameComponentCoreProjectCall extends CoreProjectCall {
  operation: 'rename-component';
  componentId: string;
  newId: string;
}

export interface ClearComponentCoreProjectCall extends CoreProjectCall {
  operation: 'clear-component';
  componentId: string;
}

export interface SetBindingCoreProjectCall extends CoreProjectCall {
  operation: 'set-binding';
  binding: CoreBindingData;
}

export interface ClearBindingCoreProjectCall extends CoreProjectCall {
  operation: 'clear-binding';
  bindingId: string;
}

export interface CoreUsage {
  type: 'binding' | 'component' | 'config';
  id: string;
  configName?: string; // only if type === 'config'
}

export interface CoreBreakingOperation {
  operation: 'update' | 'remove';
  instanceName: string;
  pluginId: string;

  usage: CoreUsage[];
}

export interface PrepareRefreshToolboxCoreProjectCallResult extends ProjectCallResult {
  breakingOperations: CoreBreakingOperation[];
  serverData: unknown;
}

export interface ApplyRefreshToolboxCoreProject extends CoreProjectCall {
  operation: 'apply-refresh-toolbox';
  serverData: unknown;
}

export interface DeployToFilesCoreProjectCallResult extends ProjectCallResult {
  files: string[];
}

export interface DeployChange {
  type: 'create' | 'update' | 'remove';
  instanceName: string;
  componentId: string;
}

export interface PrepareDeployToOnlineCoreProjectCallResult extends ProjectCallResult {
  changes: DeployChange[];
  serverData: unknown;
}

export interface ApplyDeployToOnlineCoreProjectCall extends CoreProjectCall {
  operation: 'apply-deploy-to-online';
  serverData: unknown;
}
