import { logger } from 'mylife-home-common';
import { coreImportData, BulkUpdatesStats } from '../../../../../shared/project-manager';
import { ProjectModel, PluginModel, TemplateModel, BindingModel, ComponentModel } from '../model';
import { ImportData, PluginImport, ComponentImport, loadOnlineData, loadProjectData } from './load';
import { prepareChanges } from './diff';

export { ImportData, PluginImport, ComponentImport, loadOnlineData, loadProjectData, prepareChanges };

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:import');

export interface UpdateServerData {
  updates: Update[];
}

interface Update {
  objectChangeKeys: string[];
  id: string;
  dependencies: string[];

  type: 'plugin-set' | 'plugin-clear' | 'component-set' | 'component-clear' | 'component-reset-config' | 'component-clear-config' | 'binding-clear' | 'template-clear-export';
}

interface PluginSetUpdate extends Update {
  type: 'plugin-set';
  plugin: PluginImport;
}

interface PluginClearUpdate extends Update {
  type: 'plugin-clear';
  pluginId: string;
}

interface ComponentSetUpdate extends Update {
  type: 'component-set';
  component: ComponentImport;
}

interface ComponentClearUpdate extends Update {
  type: 'component-clear';
  templateId: string;
  componentId: string;
}

interface ComponentConfigUpdate extends Update {
  type: 'component-reset-config' | 'component-clear-config';
  templateId: string;
  componentId: string;
  configId: string;
}

interface BindingClearUpdate extends Update {
  type: 'binding-clear';
  templateId: string;
  bindingId: string;
}

interface TemplateClearExportsUpdate extends Update {
  type: 'template-clear-export';
  templateId: string;
  exportType: 'config' | 'member';
  exportId: string;
}

type UpdateCreation<TUpdate> = Omit<TUpdate, 'id' | 'objectChangeKeys'>;

class ComputeContext {
  readonly updates = new Map<string, Update>();
  currentObjectChangeKey: string;

  constructor(readonly model: ProjectModel) {
  }

  ensureUpdate(id: string, creator: () => UpdateCreation<Update>) {
    let update = this.updates.get(id);
    if (!update) {
      update = { ...creator(), id, objectChangeKeys: [] };
      this.updates.set(id, update);
    }

    this.addObjectKey(id);

    return id;
  }

  private addObjectKey(updateId: string) {
    const update = this.updates.get(updateId);

    if (!update.objectChangeKeys.includes(this.currentObjectChangeKey)) {
      update.objectChangeKeys.push(this.currentObjectChangeKey);

      for (const dependency of update.dependencies) {
        this.addObjectKey(dependency);
      }
    }
  }
}

export function computeOperations(imports: ImportData, model: ProjectModel, changes: coreImportData.ObjectChange[]) {
  const context = new ComputeContext(model);

  for (const change of changes) {
    const fullChangeType = `${change.objectType}.${change.changeType}`;
    context.currentObjectChangeKey = change.key;

    switch (fullChangeType) {
      case 'component.add':
      case 'component.update': {
        const importData = imports.components.find(item => item.id === change.id);
        computeComponentSet(context, importData);
        break;
      }

      case 'component.delete': {
        const component = model.getComponent(change.id);
        computeComponentDelete(context, component);
        break;
      }

      case 'plugin.add':
      case 'plugin.update': {
        const importData = imports.plugins.find(item => item.id === change.id);
        computePluginSet(context, importData, change as coreImportData.PluginChange);
        break;
      }

      case 'plugin.delete': {
        const plugin = model.getPlugin(change.id);
        computePluginDelete(context, plugin);
        break;
      }

      case 'template.update': {
        const template = model.getTemplate(change.id);
        const typedChange = change as coreImportData.TemplateChange;
        computeTemplateExportDelete(context, template, typedChange.exportType, typedChange.exportId);
        break;
      }

      case 'template.add':
      case 'template.delete':
      default:
        throw new Error(`Change type '${change.changeType}' on object type '${change.objectType}' is not supported.`);
    }
  }
}

function computePluginSet(context: ComputeContext, importData: PluginImport, change: coreImportData.PluginChange) {
  const updateId = `plugin-set:${importData.id}`;
  
  return context.ensureUpdate(updateId, () => {

    const update: UpdateCreation<PluginSetUpdate> = {
      type: 'plugin-set',
      plugin: importData,
      dependencies: []
    };

    if (change.changeType === 'update') {
      const plugin = context.model.getPlugin(change.id);
      const components = Array.from(plugin.getAllUsage());

      for (const [id, type] of Object.entries(change.config)) {
        switch(type) {
          case 'add':
          case 'update':
            for (const component of components) {
              update.dependencies.push(computeComponentResetConfig(context, component, id));
            }

            break;

          case 'delete':
            for (const component of components) {
              update.dependencies.push(computeComponentClearConfig(context, component, id));
            }

            break;
        }
      }

      for (const [id, type] of Object.entries(change.members)) {
        switch (type) {
          // no impact on add
          case 'update': {
            const actualMember = plugin.getMember(id);
            const newMember = importData.plugin.members[id];
            if (actualMember.memberType !== newMember.memberType || actualMember.valueType !== newMember.valueType) {
              for (const component of components) {
                update.dependencies.push(computeComponentClearMember(context, component, id));
              }
            }
            break;
          }
            
          case 'delete':
            for (const component of components) {
              update.dependencies.push(computeComponentClearMember(context, component, id));
            }

            break;
        }
      }
    }

    return update;
  });
}

function computePluginDelete(context: ComputeContext, plugin: PluginModel) {
  const updateId = `plugin-clear:${plugin.id}`;

  return context.ensureUpdate(updateId, () => {

    const update: UpdateCreation<PluginClearUpdate> = {
      type: 'plugin-clear',
      pluginId: plugin.id,
      dependencies: []
    };

    for (const component of plugin.getAllUsage()) {
      update.dependencies.push(computeComponentDelete(context, component));
    }

    return update;
  });
}

function computeComponentSet(context: ComputeContext, importData: ComponentImport) {
  // check that it will not overwrite a template instantiation. If so, there is nothing to do, fail instantly
  if (context.model.hasComponent(importData.id)) {
    // will be an update
  } else {
    const dryRun = context.model.buildNamingDryRunEngine();
    dryRun.setComponent(context.model, importData.id, null);
    dryRun.validate();
  }

  const updateId = `component-set::${importData.id}`;

  return context.ensureUpdate(updateId, () => {

    const update: UpdateCreation<ComponentSetUpdate> = {
      type: 'component-set',
      component: importData,
      dependencies: []
    };

    // TODO: ensure that plugin set is also selected if it exists

    return update;
  });
}

function computeComponentClearConfig(context: ComputeContext, component: ComponentModel, configId: string) {
  // TODO
  return 'TODO';
}

function computeComponentResetConfig(context: ComputeContext, component: ComponentModel, configId: string) {
  // TODO
  return 'TODO';
}

function computeComponentClearMember(context: ComputeContext, component: ComponentModel, memberName: string) {
  // not directly an update, but can lead to updates on bindings/templates
  // TODO
  return 'TODO';
}

function computeComponentDelete(context: ComputeContext, component: ComponentModel) {
  const updateId = `component-clear:${component.ownerTemplate?.id || ''}:${component.id}`;

  return context.ensureUpdate(updateId, () => {
    const update: UpdateCreation<ComponentClearUpdate> = {
      type: 'component-clear',
      templateId: component.ownerTemplate?.id || null,
      componentId: component.id,
      dependencies: []
    };

    const componentModel = context.model.getComponent(update.componentId);
    for (const binding of componentModel.getAllBindings()) {
      update.dependencies.push(computeBindingDelete(context, binding));
    }

    if (component.ownerTemplate) {
      const template = component.ownerTemplate;

      for (const [id, item] of Object.entries(template.data.exports.config)) {
        if (item.component === component.id) {
          update.dependencies.push(computeTemplateExportDelete(context, template, 'config', id));
        }
      }

      for (const [id, item] of Object.entries(template.data.exports.members)) {
        if (item.component === component.id) {
          update.dependencies.push(computeTemplateExportDelete(context, template, 'member', id));
        }
      }
    }

    return update;
  });
}

function computeBindingDelete(context: ComputeContext, binding: BindingModel) {
  const updateId = `binding-clear:${binding.ownerTemplate?.id || ''}:${binding.id}`;

  return context.ensureUpdate(updateId, () => {

    const update: UpdateCreation<BindingClearUpdate> = {
      type: 'binding-clear',
      templateId: binding.ownerTemplate?.id || null,
      bindingId: binding.id,
      dependencies: []
    };

    return update;
  });
}

function computeTemplateExportDelete(context: ComputeContext, template: TemplateModel, exportType: 'config' | 'member', exportId: string) {
  const updateId = `template-clear-export:${template.id}:${exportType}:${exportId}`;

  // TODO

  return updateId;
}

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

/*

  clearExport(exportType: 'config' | 'member', exportId: string) {
    const updatedComponents = new Set<ComponentModel>();

    switch (exportType) {
    case 'config': {
      const exports = this.data.exports.config;
      const configExport = exports[exportId];
      const component = this.getComponent(exports[exportId].component);
      component.unexportConfig(configExport.configName);
      updatedComponents.add(component);

      delete exports[exportId];

      // FIXME: consequences

      break;
    }

    case 'member': {
      const exports = this.data.exports.members;
      delete exports[exportId];

      // FIXME: consequences

      break;
    }

    default:
      throw new Error(`Invalid export type: '${exportType}'`);
    }

    return { updatedComponents: Array.from(updatedComponents) };
  }
*/

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