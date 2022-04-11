import { logger } from 'mylife-home-common';
import { BulkUpdatesStats } from '../../../../../shared/project-manager';
import { PluginImport, ComponentImport } from './load';
import { UpdateServerData, Update, PluginSetUpdate, PluginClearUpdate, ComponentSetUpdate, ComponentClearUpdate, ComponentConfigUpdate, BindingClearUpdate, TemplateClearExportsUpdate } from './update-types';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:import');

export interface UpdateApi {
  setPlugin: (plugin: PluginImport) => void;
  clearPlugin: (pluginId: string) => void;
  setComponent: (component: ComponentImport) => void; // always directly on project
  resetComponentConfig: (templateId: string, componentId: string, configId: string) => void;
  clearComponentConfig: (templateId: string, componentId: string, configId: string) => void;
  clearComponent: (tcomponentId: string) => void; // always directly on project
  clearBinding: (templateId: string, bindingId: string) => void;
  clearTemplateExport: (templateId: string, exportType: 'config' | 'member', exportId: string) => void;
}

class ApplyContext {
  // We must keep tracks on updated component to avoid to apply clear/reset of config (triggered by plugin updates) on already updated components
  private readonly updatedComponents = new Set<string>();

  readonly stats = {
    plugins: new Set<string>(),
    components: new Set<string>(),
    templates: new Set<string>(),
    bindings: new Set<string>(),
  };

  constructor(private readonly selection: Set<string>, readonly api: UpdateApi) {
  }

  isSelected(update: Update) {
    for (const key of update.objectChangeKeys) {
      if (this.selection.has(key)) {
        return true;
      }
    }
  
    return false;
  }

  statsAddPlugin(pluginId: string) {
    this.stats.plugins.add(pluginId);
  }

  statsAddComponent(templateId: string, componentId: string) {
    this.stats.components.add(`${templateId || ''}:${componentId}`);
  }

  statsAddTemplate(templateId: string) {
    this.stats.templates.add(templateId);
  }

  statsAddBinding(templateId: string, bindingId: string) {
    this.stats.bindings.add(`${templateId || ''}:${bindingId}`);
  }

  markComponentUpdated(id: string) {
    this.updatedComponents.add(id);
  }

  isComponentUpdated(id: string) {
    return this.updatedComponents.has(id);
  }

  buildStats() {
    const stats: BulkUpdatesStats = {
      plugins: this.stats.plugins.size,
      components: this.stats.components.size,
      templates: this.stats.templates.size,
      bindings: this.stats.bindings.size,
    };

    return stats;
  }
}

/*
updates cn be applied in this order:
'binding-clear' => no deps
'component-clear' => always root update
'plugin-set' => before component-set
'component-set' => before plugin-clear, in case of pluginId update
'plugin-clear'
'template-clear-export' => no checks on exports data
'component-clear-config' => no checks on config data
'component-reset-config' => use template recursion to get config type, must be applied after template/plugin updates
*/

const ORDER: readonly Update['type'][] = [
  'binding-clear',
  'component-clear',
  'plugin-set',
  'component-set',
  'plugin-clear',
  'template-clear-export',
  'component-clear-config',
  'component-reset-config',
];

export function applyUpdates(serverData: UpdateServerData, selection: Set<string>, api: UpdateApi) {
  const context = new ApplyContext(selection, api);

  log.info('Starting update');
  
  const updates: { [type in Update['type']]: Update[]} = {
    'plugin-set': [],
    'plugin-clear': [],
    'component-set': [],
    'component-clear': [],
    'component-reset-config': [],
    'component-clear-config': [],
    'binding-clear': [],
    'template-clear-export': [],
  };

  for (const update of serverData.updates) {
    if (context.isSelected(update)) {
      updates[update.type].push(update);
    }
  }

  for (const type of ORDER) {
    for (const update of updates[type]) {
      applyUpdate(context, update);
    }
  }

  const stats = context.buildStats();
  log.info(`Updated (${stats.plugins} plugins, ${stats.components} components, ${stats.templates} templates, ${stats.bindings} bindings)`);

  return stats;
}

function applyUpdate(context: ApplyContext, update: Update) {
  switch (update.type) {
    case 'plugin-set': {
      const { plugin } = update as PluginSetUpdate;
      log.debug(`Update: set plugin '${update.id}'`);
      context.api.setPlugin(plugin);
      context.statsAddPlugin(plugin.id);

      break;
    }

    case 'plugin-clear': {
      const { pluginId } = update as PluginClearUpdate;
      log.debug(`Update: delete plugin '${pluginId}'`);
      context.api.clearPlugin(pluginId);
      context.statsAddPlugin(pluginId);
 
      break;
    }

    case 'component-set': {
      const { component } = update as ComponentSetUpdate;
      log.debug(`Update: set component '${component.id}'`);
      context.api.setComponent(component);
      context.statsAddComponent(null, component.id);
      context.markComponentUpdated(component.id);

      break;
    }

    case 'component-clear': {
      const { componentId } = update as ComponentClearUpdate;
      log.debug(`Update: delete component '${componentId}'`);
      context.api.clearComponent(componentId); // always directly on project
      context.statsAddComponent(null, componentId);
      context.markComponentUpdated(componentId);

      break;
    }

    case 'component-reset-config': {
      const { templateId, componentId, configId } = update as ComponentConfigUpdate;
      if (!templateId && context.isComponentUpdated(componentId)) {
        // already part of a component set/clear, so we don't apply this update which is dependency
        break;
      }

      log.debug(`Update: reset component config '${componentId}' - '${configId}' (template='${templateId}')`);
      context.api.resetComponentConfig(templateId, componentId, configId);
      context.statsAddComponent(templateId, componentId);

      break;
    }

    case 'component-clear-config': {
      const { templateId, componentId, configId } = update as ComponentConfigUpdate;
      if (!templateId && context.isComponentUpdated(componentId)) {
        // already part of a component set/clear, so we don't apply this update which is dependency
        break;
      }

      log.debug(`Update: clear component config '${componentId}' - '${configId}' (template='${templateId}')`);
      context.api.clearComponentConfig(templateId, componentId, configId);
      context.statsAddComponent(templateId, componentId);

      break;
    }

    case 'binding-clear': {
      const { templateId, bindingId } = update as BindingClearUpdate;
      log.debug(`Update: delete binding '${bindingId}' (template='${templateId}')`);
      context.api.clearBinding(templateId, bindingId);
      context.statsAddBinding(templateId, bindingId);

      break;
    }

    case 'template-clear-export': {
      const { templateId, exportType, exportId } = update as TemplateClearExportsUpdate;
      log.debug(`Update: delete template export '${exportType}' - '${exportId}' (template='${templateId}')`);
      context.api.clearTemplateExport(templateId, exportType, exportId);
      context.statsAddTemplate(templateId);

      break;
    }

    default:
      throw new Error(`Unsupported update type: '${update.type}'`);
  }
}
