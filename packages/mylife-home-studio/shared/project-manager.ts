import { Window, DefaultWindow, Definition, DefinitionResource } from './ui-model';
import { Component, Plugin } from './component-model';

export interface UiProject {
  name: string;
  definition: Definition;
  componentData: ComponentData;
}

export interface ComponentData {
  components: Component[]; // plugin points to plugin instanceName:module.name
  plugins: { [id: string]: PluginData; }; // id: instanceName:module.name
}

export interface PluginData extends Omit<Plugin, 'usage' | 'config'> {
  instanceName: string;
}

export interface CoreProject {
  name: string;
  // TODO
}

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

}

export interface UpdateProjectNotification {
  operation: 'set-name'
  | 'set-ui-default-window' | 'set-ui-component-data' | 'set-ui-resource' | 'clear-ui-resource' | 'rename-ui-resource' | 'set-ui-window' | 'clear-ui-window' | 'rename-ui-window';
}

export interface SetNameProjectNotification extends UpdateProjectNotification {
  operation: 'set-name';
  name: string;
}

export interface SetUiDefaultWindowNotification extends UpdateProjectNotification {
  operation: 'set-ui-default-window';
  defaultWindow: DefaultWindow;
}

export interface SetUiComponentDataNotification extends UpdateProjectNotification {
  operation: 'set-ui-component-data';
  componentData: ComponentData;
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

export interface ProjectCall {

}

export interface ProjectCallResult {

}

export interface CoreProjectCall {
  
}

export interface UiProjectCall {
  operation: 'validate' | 'set-default-window' | 'set-resource' | 'clear-resource' | 'rename-resource' | 'set-window' | 'clear-window' | 'rename-window'
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
  errors: UiValidationError[]; // TODO
}

// TODO: component data
// TODO: deployment

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
