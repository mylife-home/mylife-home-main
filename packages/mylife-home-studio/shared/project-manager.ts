import { Window, Control, DefaultWindow, Definition, DefinitionResource } from './ui-model';
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
  | 'set-ui-default-window' | 'set-ui-component-data' | 'set-ui-resource' | 'clear-ui-resource' | 'set-ui-window' | 'clear-ui-window' | 'set-ui-control' | 'clear-ui-control';
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

export type WindowOnly = Omit<Window, 'controls'>;

export interface SetUiWindowNotification extends UpdateProjectNotification {
  operation: 'set-ui-window';
  window: WindowOnly;
}

export interface ClearUiWindowNotification extends UpdateProjectNotification {
  operation: 'clear-ui-window';
  id: string;
}

export interface SetUiControlNotification extends UpdateProjectNotification {
  operation: 'set-ui-control';
  windowId: string;
  control: Control;
}

export interface ClearUiControlNotification extends UpdateProjectNotification {
  operation: 'clear-ui-control';
  windowId: string;
  id: string;
}

export interface ProjectUpdate {

}

export interface CoreProjectUpdate {
  
}

export interface UiProjectUpdate {
  operation: 'set-default-window' | 'set-resource' | 'clear-resource' | 'set-window' | 'clear-window'
}

export interface SetDefaultWindowUiProjectUpdate extends UiProjectUpdate {
  operation: 'set-default-window';
  defaultWindow: DefaultWindow;
}

// TODO: component data

export interface SetResourceUiProjectUpdate extends UiProjectUpdate {
  operation: 'set-resource';
  resource: DefinitionResource;
}

export interface ClearResourceUiProjectUpdate extends UiProjectUpdate {
  operation: 'clear-resource';
  id: string;
}

export interface SetWindowUiProjectUpdate extends UiProjectUpdate {
  operation: 'set-window';
  window: Window;
}

export interface ClearWindowUiProjectUpdate extends UiProjectUpdate {
  operation: 'clear-window';
  id: string;
}
