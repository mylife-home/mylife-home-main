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
  operation: 'create' | 'delete' | 'rename';
  type: ProjectType;
}

export interface CreateListNotification extends UpdateListNotification {
  operation: 'create';
  name: string;
}

export interface DeleteListNotification extends UpdateListNotification {
  operation: 'delete';
  name: string;
}

export interface RenameListNotification extends UpdateListNotification {
  operation: 'rename';
  oldName: string;
  newName: string;
}
