import { Definition } from './ui-model';
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
  operation: 'set' | 'clear';
  type: ProjectType;
  name: string;
}

export interface SetListNotification extends UpdateListNotification {
  info: ProjectInfo;
}

export interface ClearListNotification extends UpdateListNotification {
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