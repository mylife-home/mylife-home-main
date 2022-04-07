import { logger, components } from 'mylife-home-common';
import { pick } from '../../../../utils/object-utils';
import { coreImportData, BulkUpdatesStats } from '../../../../../shared/project-manager';
import { ComponentModel, ProjectModel, PluginModel, TemplateModel, PluginView } from '../model';
import { PluginImport, ComponentImport } from './load';

export * from './load';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:import');

export interface UpdateServerData {
  updates: Update[];
}

interface Update {
  type: 'plugin-set' | 'plugin-clear' | 'component-set' | 'component-clear';
  id: string;
  impacts: Impact[];
  dependencies: string[];
}

interface PluginSetUpdate extends Update {
  type: 'plugin-set';
  plugin: PluginImport;
}

interface ComponentSetUpdate extends Update {
  type: 'component-set';
  component: ComponentImport;
}

interface Impact {
  type: 'binding-delete' | 'component-delete' | 'component-config-clear' | 'component-config-reset';
}

interface BindingDeleteImpact extends Impact {
  type: 'binding-delete';
  templateId: string;
  bindingId: string;
}

interface ComponentDeleteImpact extends Impact {
  type: 'component-delete';
  templateId: string;
  componentId: string;
}

interface ComponentConfigImpact extends Impact {
  type: 'component-config-clear' | 'component-config-reset';
  templateId: string;
  componentId: string;
  configId: string;
}

export function prepareChanges(imports: ImportData, model: ProjectModel) {
  const pluginsChanges = preparePluginUpdates(imports, model);
  const componentsChanges = prepareComponentUpdates(imports, model);

  lookupPluginsChangesImpacts(imports, model, pluginsChanges);
  lookupComponentsChangesImpacts(imports, model, componentsChanges);

  const changes = [ ...pluginsChanges, ...componentsChanges];
  lookupDependencies(imports, model, changes);
  const serverData = prepareServerData(imports, changes);

  return { changes, serverData };
}

function preparePluginUpdates(imports: ImportData, model: ProjectModel): coreImportData.PluginChange[] {
  const changes: coreImportData.PluginChange[] = [];

  for (const pluginImport of imports.plugins) {
    const id = pluginImport.id;

    if (!model.hasPlugin(id)) {
      add(pluginImport);
    } else {
      const pluginModel = model.getPlugin(id);
      if (!arePluginsEqual(pluginModel, pluginImport)) {
        update(pluginModel, pluginImport);
      }
    }
  }

  const pluginsImportsIds = new Set(imports.plugins.map(pluginImport => pluginImport.id));
  for (const id of model.getPluginsIds()) {
    if (!pluginsImportsIds.has(id)) {
      const pluginModel = model.getPlugin(id);
      remove(pluginModel);
    }
  }

  return changes;

  function add(pluginImport: PluginImport) {
    const id = pluginImport.id;
    const change = newPluginChange(`plugin-set:${id}`, id, pluginImport.instanceName, 'add', { version: { before: null, after: pluginImport.plugin.version } });

    change.usage = pluginImport.plugin.usage;
    const objectChanges = buildPluginMembersAndConfigChanges(null, pluginImport.plugin);
    change.config = objectChanges.config;
    change.members = objectChanges.members;

    changes.push(change);
  }

  function update(pluginModel: PluginModel, pluginImport: PluginImport) {
    const id = pluginModel.id;
    const change = newPluginChange(`plugin-set:${id}`, id, pluginModel.instance.instanceName, 'update', { version: { before: pluginModel.data.version, after: pluginImport.plugin.version } });

    if (pluginModel.data.usage !== pluginImport.plugin.usage) {
      change.usage = pluginImport.plugin.usage;
    }

    const objectChanges = buildPluginMembersAndConfigChanges(pluginModel, pluginImport.plugin);
    change.config = objectChanges.config;
    change.members = objectChanges.members;

    changes.push(change);
  }

  function remove(pluginModel: PluginModel) {
    const id = pluginModel.id;
    const change = newPluginChange(`plugin-clear:${id}`, id, pluginModel.instance.instanceName, 'delete', { version: { before: pluginModel.data.version, after: null } });
    changes.push(change);
  }
}

// used by deploy validation
export function buildPluginMembersAndConfigChanges(pluginModel: PluginModel | PluginView, plugin: components.metadata.NetPlugin) {
  const config = lookupObjectChanges(pluginModel?.data?.config, plugin?.config, configEqualityComparer, typeChangeFormatter);
  const members = lookupObjectChanges(pluginModel?.data?.members, plugin?.members, memberEqualityComparer, typeChangeFormatter);
  return { config, members };

  function memberEqualityComparer(memberModel: components.metadata.NetMember, memberImport: components.metadata.NetMember) {
    return memberModel.memberType === memberImport.memberType
      && memberModel.valueType === memberImport.valueType
      && memberModel.description === memberImport.description;
  }

  function configEqualityComparer(configModel: components.metadata.ConfigItem, configImport: components.metadata.ConfigItem) {
    return configModel.valueType === configImport.valueType
      && configModel.description === configImport.description;
  }

  function typeChangeFormatter(name: string, type: coreImportData.ChangeType) {
    return type;
  }
}

function prepareComponentUpdates(imports: ImportData, model: ProjectModel): coreImportData.ComponentChange[] {
  const changes: coreImportData.ComponentChange[] = [];

  // A project is supposed to deploy full instances only.
  // So we can consider each instance with components on imported project, and deduce a list of deleted components per instance
  const pluginImportsInstances = new Map<string, string>();
  for (const pluginImport of imports.plugins) {
    pluginImportsInstances.set(pluginImport.id, pluginImport.instanceName);
  }

  const componentsImportsByInstanceName = new Map<string, Set<string>>();
  for (const componentImport of imports.components) {
    const instanceName = pluginImportsInstances.get(componentImport.pluginId);
    let set = componentsImportsByInstanceName.get(instanceName);
    if (!set) {
      set = new Set();
      componentsImportsByInstanceName.set(instanceName, set);
    }

    set.add(componentImport.id);
  }

  for (const componentImport of imports.components) {
    const id = componentImport.id;
    if (!model.hasComponent(id)) {
      const instanceName = pluginImportsInstances.get(componentImport.pluginId);
      add(componentImport, instanceName);
    } else {
      const componentModel = model.getComponent(id);
      if (!areComponentsEqual(componentModel, componentImport)) {
        update(componentModel, componentImport);
      }
    }
  }

  for (const [instanceName, set] of componentsImportsByInstanceName.entries()) {
    if (!model.hasInstance(instanceName)) {
      continue;
    }

    const instanceModel = model.getInstance(instanceName);
    for (const componentModel of instanceModel.getAllUsage()) {
      if (!set.has(componentModel.id)) {
        remove(componentModel);
      }
    }
  }

  return changes;

  function add(componentImport: ComponentImport, instanceName: string) {
    const id = componentImport.id;
    const change = newComponentChange(`component-set:${id}`, id, instanceName, 'add', pick(componentImport, 'pluginId', 'external'));

    change.config = lookupObjectChanges(null, componentImport.config, Object.is, configChangeFormatter);

    changes.push(change);
  }

  function update(componentModel: ComponentModel, componentImport: ComponentImport) {
    const id = componentModel.id;
    // Note: instanceName may have changed.
    const change = newComponentChange(`component-set:${id}`, id, getInstanceName(componentModel), 'update');

    if (!(componentModel.definition instanceof PluginModel) || componentModel.definition.id !== componentImport.pluginId) {
      change.pluginId = componentImport.pluginId;
    }

    if (componentModel.data.external !== componentImport.external) {
      change.external = componentImport.external;
    }

    change.config = lookupObjectChanges(componentModel.data.config, componentImport.config, Object.is, configChangeFormatter);

    changes.push(change);
  }

  function remove(componentModel: ComponentModel) {
    const id = componentModel.id;
    const change = newComponentChange(`component-clear:${id}`, id, getInstanceName(componentModel), 'delete');
    changes.push(change);
  }

  function configChangeFormatter(name: string, type: coreImportData.ChangeType, valueModel: any, valueImport: any) {
    return { type, value: valueImport };
  }

  function getInstanceName(componentModel: ComponentModel) {
    if (componentModel.definition instanceof PluginModel) {
      return componentModel.definition.instance.instanceName;
    }

    if (componentModel.definition instanceof TemplateModel) {
      return '<Templates>';
    }

    throw new Error('Unsupported definition type');
  }
}

function newPluginChange(key: string, id: string, instanceName: string, changeType: coreImportData.ChangeType, props: Partial<coreImportData.PluginChange> = {}) {
  const change: coreImportData.PluginChange = {
    key,
    id,
    instanceName,
    changeType,
    objectType: 'plugin',
    dependencies: [],
    version: { before: null, after: null },
    usage: null,
    config: {},
    members: {},
    impacts: null,
    ...props
  };

  return change;
}

function newComponentChange(key: string, id: string, instanceName: string, changeType: coreImportData.ChangeType, props: Partial<coreImportData.ComponentChange> = {}) {
  const change: coreImportData.ComponentChange = {
    key,
    id, 
    instanceName,
    changeType,
    objectType: 'component',
    dependencies: [],
    config: {},
    external: null,
    pluginId: null,
    impacts: null,
    ...props
  };

  return change;
}

function arePluginsEqual(pluginModel: PluginModel, pluginImport: PluginImport) {
  return pluginModel.instance.instanceName === pluginImport.instanceName
    && pluginModel.data.module === pluginImport.plugin.module
    && pluginModel.data.name === pluginImport.plugin.name
    && pluginModel.data.version === pluginImport.plugin.version;
}

function areComponentsEqual(componentModel: ComponentModel, componentImport: ComponentImport) {
  const baseEqual = componentModel.id === componentImport.id
    && componentModel.definition instanceof PluginModel
    && componentModel.definition.id === componentImport.pluginId
    && componentModel.data.external === componentImport.external
    && !!componentModel.data.config === !!componentImport.config;

  if (!baseEqual) {
    return false;
  }

  // compare config
  if (!componentModel.data.config) {
    // no config
    return true;
  }

  const configModel = componentModel.data.config;
  const configImport = componentImport.config;

  const modelKeys = Object.keys(configModel);
  const configKeys = Object.keys(configImport);
  if (modelKeys.length !== configKeys.length) {
    return false;
  }

  for (const [key, valueModel] of Object.entries(configModel)) {
    if (!configImport.hasOwnProperty(key)) {
      return false;
    }

    const valueImport = configImport[key];

    if (!Object.is(valueModel, valueImport)) {
      return false;
    }
  }

  return true;
}

function lookupObjectChanges<Value, Change>(objectModel: { [name: string]: Value; }, objectImport: { [name: string]: Value; }, equalityComparer: (valueModel: Value, valueImport: Value) => boolean, changesFormatter: (name: string, type: coreImportData.ChangeType, valueModel: Value, valueImport: Value) => Change) {
  const changes: { [name: string]: Change; } = {};

  const safeObjectModel = objectModel || {};
  const safeObjectImport = objectImport || {};
  for (const [name, valueImport] of Object.entries(safeObjectImport)) {
    if (!safeObjectModel.hasOwnProperty(name)) {
      changes[name] = changesFormatter(name, 'add', null, valueImport);
    } else {
      const valueModel = safeObjectModel[name];
      const valueImport = safeObjectImport[name];
      if (!equalityComparer(valueModel, valueImport)) {
        changes[name] = changesFormatter(name, 'update', valueModel, valueImport);
      }
    }
  }

  for (const [name, valueModel] of Object.entries(safeObjectModel)) {
    if (!safeObjectImport.hasOwnProperty(name)) {
      changes[name] = changesFormatter(name, 'delete', valueModel, null);
    }
  }

  return changes;
}

function lookupPluginsChangesImpacts(imports: ImportData, model: ProjectModel, changes: coreImportData.PluginChange[]) {
  for (const change of changes.filter(change => change.changeType === 'delete')) {
    const plugin = model.getPlugin(change.id);
    const bindingsIds = new Set<string>();
    for (const component of plugin.getAllUsage()) {
      for (const binding of component.getAllBindings()) {
        bindingsIds.add(binding.id);
      }
    }

    change.impacts = {
      components: getAllUsageId(plugin),
      bindings: Array.from(bindingsIds)
    };
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

    const dryRun = this.project.buildNamingDryRunEngine();
    dryRun.setComponent(this, change.id, null);
    dryRun.validate();
  }

  for (const change of changes.filter(change => change.changeType === 'delete')) {
    const component = model.getComponent(change.id);
    change.impacts = {
      bindings: Array.from(component.getAllBindingsIds())
    };
  }

  for (const change of changes.filter(change => change.changeType === 'update')) {
    // only impacts on plugin change
    // TODO: could also only lookup for properties that actually changed
    if (change.pluginId) {
      const component = model.getComponent(change.id);
      change.impacts = {
        bindings: Array.from(component.getAllBindingsIds())
      };
    }
  }
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

  function buildBindingImpacts(update: Update, change: { impacts: { bindings: string[]; }; }) {
    if (!change.impacts) {
      return;
    }

    for (const bindingId of change.impacts.bindings) {
      const impact: BindingDeleteImpact = { type: 'binding-delete', bindingId };
      update.impacts.push(impact);
    }
  }

  function buildComponentImpacts(update: Update, change: { impacts: { components: string[]; }; }) {
    if (!change.impacts) {
      return;
    }

    for (const componentId of change.impacts.components) {
      const impact: ComponentDeleteImpact = { type: 'component-delete', componentId };
      update.impacts.push(impact);
    }
  }
}

export interface UpdateApi {
  clearPlugin: (id: string) => void;
  clearComponent: (templateId: string, id: string) => void;
  clearBinding: (templateId: string, id: string) => void;
  setPlugin: (plugin: PluginImport) => void;
  setComponent: (component: ComponentImport) => void;
  updateComponentConfig: (templateId: string, componentId: string, configId: string, type: 'clear' | 'reset') => void;
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