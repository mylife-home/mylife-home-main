import { logger } from 'mylife-home-common';
import { PluginImport, ComponentImport } from './load';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:import');

export interface UpdateServerData {
  updates: Update[];
}

export interface Update {
  objectChangeKeys: string[];
  id: string;
  dependencies: string[];

  type: 'plugin-set' | 'plugin-clear' | 'component-set' | 'component-clear' | 'component-reset-config' | 'component-clear-config' | 'binding-clear' | 'template-clear-export';
}

export interface PluginSetUpdate extends Update {
  type: 'plugin-set';
  plugin: PluginImport;
}

export interface PluginClearUpdate extends Update {
  type: 'plugin-clear';
  pluginId: string;
}

export interface ComponentSetUpdate extends Update {
  type: 'component-set';
  component: ComponentImport;
}

export interface ComponentClearUpdate extends Update {
  type: 'component-clear';
  templateId: string;
  componentId: string;
}

export interface ComponentConfigUpdate extends Update {
  type: 'component-reset-config' | 'component-clear-config';
  templateId: string;
  componentId: string;
  configId: string;
}

export interface BindingClearUpdate extends Update {
  type: 'binding-clear';
  templateId: string;
  bindingId: string;
}

export interface TemplateClearExportsUpdate extends Update {
  type: 'template-clear-export';
  templateId: string;
  exportType: 'config' | 'member';
  exportId: string;
}
