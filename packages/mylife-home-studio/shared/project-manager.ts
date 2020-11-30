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