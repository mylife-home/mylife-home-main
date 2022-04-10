import { logger } from 'mylife-home-common';
import { coreImportData, BulkUpdatesStats } from '../../../../../shared/project-manager';
import { ProjectModel, PluginModel, TemplateModel, BindingModel, ComponentModel } from '../model';
import { ImportData, PluginImport, ComponentImport, loadOnlineData, loadProjectData } from './load';
import { prepareChanges } from './diff';
import { UpdateServerData, Update, PluginSetUpdate, PluginClearUpdate, ComponentSetUpdate, ComponentClearUpdate, ComponentConfigUpdate, BindingClearUpdate, TemplateClearExportsUpdate } from './update-types';
import { buildUpdates } from './update-builder';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:import');

export interface UpdateApi {
  setPlugin: (plugin: PluginImport) => void;
  clearPlugin: (pluginId: string) => void;
  setComponent: (component: ComponentImport) => void;
  resetComponentConfig: (templateId: string, componentId: string, configId: string) => void;
  clearComponentConfig: (templateId: string, componentId: string, configId: string) => void;
  clearComponent: (templateId: string, componentId: string) => void;
  clearBinding: (templateId: string, bindingId: string) => void;
  clearTemplateExport: (templateId: string, exportType: 'config' | 'member', exportId: string) => void;
}

export function applyUpdates(serverData: UpdateServerData, selection: Set<string>, api: UpdateApi) {
  const stats: BulkUpdatesStats = {
    plugins: 0,
    components: 0,
    templates: 0,
    bindings: 0,
  };

  log.info('Starting update');

  for (const update of serverData.updates) {
    if (!shouldApply(update, selection)) {
      continue;
    }

    for (const impact of update.impacts) {
      applyPrevImpact(impact, api, stats);
    }

    applyUpdate(update, api, stats);

    for (const impact of update.impacts) {
      applyNextImpact(impact, api, stats);
    }
  }

  log.info(`Updated (${stats.plugins} plugins, ${stats.components} components, ${stats.templates} templates, ${stats.bindings} bindings)`);

  return stats;
}

function applyPrevImpact(impact: Impact, api: UpdateApi, stats: BulkUpdatesStats) {
  switch (impact.type) {
    case 'binding-delete': {
      const typedImpact = impact as BindingDeleteImpact;
      log.debug(`Impact: delete binding '${typedImpact.bindingId}' (template='${typedImpact.templateId}')`);
      api.clearBinding(typedImpact.templateId, typedImpact.bindingId);
      ++stats.bindings;
      break;
    }

    case 'component-delete': {
      const typedImpact = impact as ComponentDeleteImpact;
      log.debug(`Impact: delete component '${typedImpact.componentId}' (template='${typedImpact.templateId}')`);
      api.clearComponent(typedImpact.templateId, typedImpact.componentId);
      ++stats.components;
      break;
    }

    case 'component-config-clear':
    case 'component-config-reset':
      // will be applied after
      break;

    default:
      throw new Error(`Unsupported impact type: '${impact.type}'`);
  }
}

function applyNextImpact(impact: Impact, api: UpdateApi, stats: BulkUpdatesStats) {
  switch (impact.type) {
    case 'binding-delete':
    case 'component-delete':
      // applied before
      break;

    case 'component-config-clear':
    case 'component-config-reset': {
      const type = impact.type === 'component-config-clear' ? 'clear' : 'reset';
      const typedImpact = impact as ComponentConfigImpact;
      log.debug(`Impact: config component '${type}' -> '${typedImpact.componentId}' - '${typedImpact.configId}' (template='${typedImpact.templateId}')`);
      api.updateComponentConfig(typedImpact.templateId, typedImpact.componentId, typedImpact.configId, type);
      ++stats.components;
      break;
    }

    default:
      throw new Error(`Unsupported impact type: '${impact.type}'`);
  }
}

function applyUpdate(update: Update, api: UpdateApi, stats: BulkUpdatesStats) {
  switch (update.type) {
    case 'plugin-clear': {
      log.debug(`Update: delete plugin '${update.id}'`);
      api.clearPlugin(update.id);
      ++stats.plugins;
      break;
    }

    case 'component-clear': {
      log.debug(`Update: delete component '${update.id}'`);
      api.clearComponent(null, update.id); // always directly on project
      ++stats.components;
      break;
    }

    case 'plugin-set': {
      const { plugin } = update as PluginSetUpdate;
      log.debug(`Update: set plugin '${update.id}'`);
      api.setPlugin(plugin);
      ++stats.plugins;
      break;
    }

    case 'component-set': {
      const { component } = update as ComponentSetUpdate;
      log.debug(`Update: set component '${update.id}'`);
      api.setComponent(component);
      ++stats.components;
      break;
    }

    default:
      throw new Error(`Unsupported update type: '${update.type}'`);
  }
}

// TODO: apply this logic again

function shouldApply(update: Update, selection: Set<string>) {
  const dependency = update.dependencies[0];

  if (dependency) {
    // dependency only for components
    const isDelete = update.type === 'component-clear';
    const dependencySelected = selection.has(dependency);

    if (isDelete && dependencySelected) {
      // will already be deleted as an impact of plugin delete
      return false;
    }

    if (!isDelete && !dependencySelected) {
      // cannot apply component without plugin
      return false;
    }
  }

  const key = `${update.type}:${update.id}`;
  return selection.has(key);
}