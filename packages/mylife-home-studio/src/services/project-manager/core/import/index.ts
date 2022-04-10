import { logger } from 'mylife-home-common';
import { coreImportData, BulkUpdatesStats } from '../../../../../shared/project-manager';
import { ProjectModel, PluginModel, TemplateModel, BindingModel, ComponentModel } from '../model';
import { ImportData, PluginImport, ComponentImport, loadOnlineData, loadProjectData } from './load';
import { prepareChanges } from './diff';
import { UpdateServerData, Update, PluginSetUpdate, PluginClearUpdate, ComponentSetUpdate, ComponentClearUpdate, ComponentConfigUpdate, BindingClearUpdate, TemplateClearExportsUpdate } from './update-types';
import { buildUpdates } from './update-builder';

export { ImportData, PluginImport, ComponentImport, loadOnlineData, loadProjectData, prepareChanges, UpdateServerData, buildUpdates };

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:import');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
export function computeOperations(imports: ImportData, model: ProjectModel, changes: coreImportData.ObjectChange[]) {
  const pluginsChanges = changes.filter(change => change.objectType === 'plugin') as coreImportData.PluginChange[];
  const componentsChanges = changes.filter(change => change.objectType === 'component') as coreImportData.ComponentChange[];

  lookupPluginsChangesImpacts(imports, model, pluginsChanges);
  lookupComponentsChangesImpacts(imports, model, componentsChanges);

  return prepareServerData(imports, changes);
}

// TODO: templates exports
function lookupPluginsChangesImpacts(imports: ImportData, model: ProjectModel, changes: coreImportData.PluginChange[]) {
  for (const change of changes.filter(change => change.changeType === 'delete')) {
    const plugin = model.getPlugin(change.id);

    change.impacts = {
      templates: [],
      components: [],
      bindings: []
    };

    const templatesIds = new Set<string>();
    const bindingsIds = new Map<string, coreImportData.BindingId>();
    for (const component of plugin.getAllUsage()) {
      const template = component.ownerTemplate;
      
      if (template && hasComponentTemplateImpact(template, component.id)) {
        templatesIds.add(template.id);
      }

      const templateId = template?.id ?? null;

      for (const binding of component.getAllBindings()) {
        bindingsIds.set(`${templateId}:${binding.id}`, { templateId, bindingId: binding.id });
      }
    }
  }

  for (const change of changes.filter(change => change.changeType === 'update')) {
    const importPlugin = imports.plugins.find(importPlugin => importPlugin.id === change.id);
    const modelPlugin = model.getPlugin(change.id);

    let componentsImpact: string[] = [];
    if (hasConfigChanges(modelPlugin, importPlugin, change)) {
      componentsImpact = getAllUsageId(modelPlugin);
    }

    const membersNames = getMembersChanges(modelPlugin, importPlugin, change);
    const bindingsIds = new Set<string>();
    for (const component of modelPlugin.getAllUsage()) {
      for (const memberName of membersNames) {
        for (const binding of component.getAllBindingsWithMember(memberName)) {
          bindingsIds.add(binding.id);
        }
      }
    }

    change.impacts = {
      components: componentsImpact,
      bindings: Array.from(bindingsIds)
    };
  }
}


function hasComponentTemplateImpact(templateModel: TemplateModel, componentId: string) {
  const exports = templateModel.data.exports;

  for (const item of Object.values(exports.config)) {
    if (item.component === componentId) {
      return true;
    }
  }

  for (const item of Object.values(exports.members)) {
    if (item.component === componentId) {
      return true;
    }
  }

  return false;

}

function hasPropertyTemplateImpact(templateModel: TemplateModel, componentId: string, propertyType: 'config' | 'member', propertyId: string) {
  const exports = templateModel.data.exports;
  switch (propertyType) {
    case 'config': {
      for (const item of Object.values(exports.config)) {
        if (item.component === componentId && item.configName === propertyId) {
          return true;
        }
      }

      break;
    }

    case 'member': {
      for (const item of Object.values(exports.members)) {
        if (item.component === componentId && item.member === propertyId) {
          return true;
        }
      }

      break;
    }
  }

  return false;
}

function getAllUsageId(plugin: PluginModel) {
  return Array.from(plugin.getAllUsage()).map(componentModel => componentModel.id);
}

function getMembersChanges(modelPlugin: PluginModel, importPlugin: PluginImport, change: coreImportData.PluginChange) {
  const membersNames: string[] = [];

  for (const [name, type] of Object.entries(change.members)) {
    switch (type) {
      case 'add':
        // no impact
        break;

      case 'update': {
        const importMember = importPlugin.plugin.members[name];
        const modelMember = modelPlugin.data.members[name];
        // TODO: later we may compare that valueType are compatible (import is a superset or action or a subset for state)
        if (importMember.memberType !== modelMember.memberType || importMember.valueType !== modelMember.valueType) {
          membersNames.push(name);
        }

        break;
      }

      case 'delete':
        membersNames.push(name);
        break;
    }
  }

  return membersNames;
}

function hasConfigChanges(modelPlugin: PluginModel, importPlugin: PluginImport, change: coreImportData.PluginChange) {
  for (const [name, type] of Object.entries(change.config)) {
    switch (type) {
      case 'add':
        // no impact
        break;

      case 'update': {
        const importConfig = importPlugin.plugin.config[name];
        const modelConfig = modelPlugin.data.config[name];

        if (importConfig.valueType !== modelConfig.valueType) {
          return true;
        }

        break;
      }

      case 'delete':
        return true;
    }
  }

  return false;
}

function lookupComponentsChangesImpacts(imports: ImportData, model: ProjectModel, changes: coreImportData.ComponentChange[]) {
  // on add, make sure we don't overwrite template instantiation. If it's the case, let's give up
  for (const change of changes.filter(change => change.changeType === 'add')) {
    if (model.hasComponent(change.id)) {
      // will be an update
      continue;
    }

    const dryRun = model.buildNamingDryRunEngine();
    dryRun.setComponent(this, change.id, null);
    dryRun.validate();
  }

  for (const change of changes.filter(change => change.changeType === 'delete')) {
    addBindingsImpact(model, change);
  }

  for (const change of changes.filter(change => change.changeType === 'update')) {
    // only impacts on plugin change
    // TODO: could also only lookup for properties that actually changed
    if (change.pluginId) {
      addBindingsImpact(model, change);
    }
  }
}

function addBindingsImpact(model: ProjectModel, change: coreImportData.ComponentChange) {
  const component = model.getComponent(change.id);
  const bindingIds = Array.from(component.getAllBindingsIds());
  change.impacts = {
    templates: [],
    // component is on project, so binding is also on project directly
    bindings: bindingIds.map(bindingId => ({ templateId: null, bindingId }))
  };
}

function lookupDependencies(imports: ImportData, model: ProjectModel, changes: coreImportData.ObjectChange[]) {
  const pluginsChangesKeyById = new Map<string, string>();

  for (const change of changes.filter(change => change.objectType === 'plugin')) {
    pluginsChangesKeyById.set(change.id, change.key);
  }

  const componentsImports = new Map<string, ComponentImport>();
  for (const componentImport of imports.components) {
    componentsImports.set(componentImport.id, componentImport);
  }

  for (const change of changes.filter(change => change.objectType === 'component' && change.changeType !== 'delete')) {
    const componentImport = componentsImports.get(change.id);
    const pluginKey = pluginsChangesKeyById.get(componentImport.pluginId);
    if (pluginKey) {
      change.dependencies.push(pluginKey);
    }
  }
}

function prepareServerData(imports: ImportData, changes: coreImportData.ObjectChange[]): UpdateServerData {
  const updates: Update[] = [];

  const importPlugins = new Map<string, PluginImport>();
  for (const plugin of imports.plugins) {
    importPlugins.set(plugin.id, plugin);
  }

  const importComponents = new Map<string, ComponentImport>();
  for (const component of imports.components) {
    importComponents.set(component.id, component);
  }

  for (const change of changes.filter(change => change.objectType === 'plugin' && change.changeType === 'delete')) {
    clearPlugin(change as coreImportData.PluginChange);
  }

  for (const change of changes.filter(change => change.objectType === 'plugin' && change.changeType === 'update')) {
    setPlugin(change as coreImportData.PluginChange);
  }

  for (const change of changes.filter(change => change.objectType === 'plugin' && change.changeType === 'add')) {
    setPlugin(change as coreImportData.PluginChange);
  }

  for (const change of changes.filter(change => change.objectType === 'component' && change.changeType === 'delete')) {
    clearComponent(change as coreImportData.ComponentChange);
  }

  for (const change of changes.filter(change => change.objectType === 'component' && change.changeType === 'update')) {
    setComponent(change as coreImportData.ComponentChange);
  }

  for (const change of changes.filter(change => change.objectType === 'component' && change.changeType === 'add')) {
    setComponent(change as coreImportData.ComponentChange);
  }

  return { updates };

  function clearPlugin(change: coreImportData.PluginChange) {
    const update: Update = { type: 'plugin-clear', id: change.id, dependencies: change.dependencies, impacts: [] };
    buildBindingImpacts(update, change);
    buildComponentImpacts(update, change);
    updates.push(update);
  }

  function setPlugin(change: coreImportData.PluginChange) {
    const plugin = importPlugins.get(change.id);
    const update: PluginSetUpdate = { type: 'plugin-set', id: change.id, dependencies: change.dependencies, impacts: [], plugin };
    buildBindingImpacts(update, change);
    buildComponentImpacts(update, change);
    updates.push(update);
  }

  function clearComponent(change: coreImportData.ComponentChange) {
    const update: Update = { type: 'component-clear', id: change.id, dependencies: change.dependencies, impacts: [] };
    buildBindingImpacts(update, change);
    updates.push(update);
  }

  function setComponent(change: coreImportData.ComponentChange) {
    const component = importComponents.get(change.id);
    const update: ComponentSetUpdate = { type: 'component-set', id: change.id, dependencies: change.dependencies, impacts: [], component };
    buildBindingImpacts(update, change);
    updates.push(update);
  }

  function buildBindingImpacts(update: Update, change: { impacts: { bindings: coreImportData.BindingId[]; }; }) {
    if (!change.impacts) {
      return;
    }

    for (const { templateId, bindingId } of change.impacts.bindings) {
      const impact: BindingDeleteImpact = { type: 'binding-delete', templateId, bindingId };
      update.impacts.push(impact);
    }
  }

  function buildComponentImpacts(update: Update, change: { impacts: { components: coreImportData.ComponentId[]; }; }) {
    if (!change.impacts) {
      return;
    }

    for (const { templateId, componentId } of change.impacts.components) {
      const impact: ComponentDeleteImpact = { type: 'component-delete', templateId, componentId };
      update.impacts.push(impact);
    }
  }
}
*/
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

export function applyChanges(serverData: UpdateServerData, selection: Set<string>, api: UpdateApi) {
  const stats: BulkUpdatesStats = {
    plugins: 0,
    components: 0,
    bindings: 0,
    // TODO: templates
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

  log.info(`Updated (${stats.plugins} plugins, ${stats.components} components, ${stats.bindings} bindings)`);

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