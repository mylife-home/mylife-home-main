import { logger, components } from 'mylife-home-common';
import { pick, clone } from '../../../utils/object-utils';
import { ImportFromOnlineConfig, ImportFromProjectConfig, coreImportData, BulkUpdatesStats } from '../../../../shared/project-manager';
import { ComponentModel, Model, PluginModel } from './model';
import { Services } from '../..';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:import');

export interface ImportData {
  plugins: PluginImport[];
  components: ComponentImport[];
}

export interface ComponentImport {
  id: string;
  pluginId: string;
  external: boolean;
  config: { [name: string]: any; };
}

export interface PluginImport {
  id: string;
  instanceName: string;
  plugin: components.metadata.NetPlugin;
}

export function loadOnlineData(config: ImportFromOnlineConfig): ImportData {
  const plugins = new Map<string, PluginImport>();
  const components: ComponentImport[] = [];
  const onlineService = Services.instance.online;

  if (config.importPlugins) {
    const instanceNames = onlineService.getInstanceNames();
    for (const instanceName of instanceNames) {
      const onlinePlugins = onlineService.getPlugins(instanceName);
      for (const onlinePlugin of onlinePlugins) {
        ensureOnlinePlugin(plugins, instanceName, onlinePlugin);
      }
    }
  }

  if (config.importComponents) {
    for (const { instanceName, component: onlineComponent } of onlineService.getComponentsData()) {
      const { id: pluginId } = ensureOnlinePlugin(plugins, instanceName, onlineComponent.plugin);

      components.push({
        id: onlineComponent.id,
        pluginId,
        external: true,
        config: null
      });
    }
  }

  return { plugins: Array.from(plugins.values()), components };
}

function ensureOnlinePlugin(plugins: Map<string, PluginImport>, instanceName: string, onlinePlugin: components.metadata.Plugin): PluginImport {
  const id = `${instanceName}:${onlinePlugin.id}`;

  const existing = plugins.get(id);
  if (existing) {
    return existing;
  }

  const pluginImport: PluginImport = {
    id,
    instanceName,
    plugin: components.metadata.encodePlugin(onlinePlugin)
  };

  plugins.set(id, pluginImport);
  return pluginImport;
}

export function loadProjectData(model: Model, config: ImportFromProjectConfig): ImportData {
  const plugins = new Map<string, PluginImport>();
  const components: ComponentImport[] = [];

  if (config.importPlugins) {
    for (const id of model.getPluginsIds()) {
      ensureProjectPlugin(plugins, model, id);
    }
  }

  if (config.importComponents) {
    const external = config.importComponents === 'external';

    for (const id of model.getComponentsIds()) {
      const componentModel = model.getComponent(id);
      if (componentModel.data.external) {
        continue;
      }

      ensureProjectPlugin(plugins, model, componentModel.data.plugin);

      components.push({
        id: componentModel.id,
        pluginId: componentModel.plugin.id,
        external,
        config: external ? null : clone(componentModel.data.config)
      });
    }
  }

  return { plugins: Array.from(plugins.values()), components };
}

function ensureProjectPlugin(plugins: Map<string, PluginImport>, model: Model, id: string): PluginImport {
  const existing = plugins.get(id);
  if (existing) {
    return existing;
  }

  const pluginModel = model.getPlugin(id);

  const pluginImport: PluginImport = {
    id: pluginModel.id,
    instanceName: pluginModel.data.instanceName,
    plugin: {
      ...pick(pluginModel.data, 'name', 'module', 'usage', 'version', 'description'),
      members: clone(pluginModel.data.members),
      config: clone(pluginModel.data.config),
    }
  };

  plugins.set(id, pluginImport);
  return pluginImport;
}

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
  type: 'binding-delete' | 'component-delete';
}

interface BindingDeleteImpact extends Impact {
  type: 'binding-delete';
  bindingId: string;
}

interface ComponentDeleteImpact extends Impact {
  type: 'component-delete';
  componentId: string;
}

export function prepareChanges(imports: ImportData, model: Model) {
  const pluginsChanges = preparePluginUpdates(imports, model);
  const componentsChanges = prepareComponentUpdates(imports, model);

  lookupPluginsChangesImpacts(imports, model, pluginsChanges);
  lookupComponentsChangesImpacts(imports, model, componentsChanges);

  const changes = [ ...pluginsChanges, ...componentsChanges];
  lookupDependencies(imports, model, changes);
  const serverData = prepareServerData(imports, changes);

  return { changes, serverData };
}

function preparePluginUpdates(imports: ImportData, model: Model): coreImportData.PluginChange[] {
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
export function buildPluginMembersAndConfigChanges(pluginModel: PluginModel, plugin: components.metadata.NetPlugin) {
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

function prepareComponentUpdates(imports: ImportData, model: Model): coreImportData.ComponentChange[] {
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
    for (const componentModel of instanceModel.components.values()) {
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
    const change = newComponentChange(`component-set:${id}`, id, componentModel.instance.instanceName, 'update');

    if (componentModel.plugin.id !== componentImport.pluginId) {
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
    const change = newComponentChange(`component-clear:${id}`, id, componentModel.instance.instanceName, 'delete');
    changes.push(change);
  }

  function configChangeFormatter(name: string, type: coreImportData.ChangeType, valueModel: any, valueImport: any) {
    return { type, value: valueImport };
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
    && componentModel.plugin.id === componentImport.pluginId
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

function lookupPluginsChangesImpacts(imports: ImportData, model: Model, changes: coreImportData.PluginChange[]) {
  for (const change of changes.filter(change => change.changeType === 'delete')) {
    const plugin = model.getPlugin(change.id);
    const bindingsIds = new Set<string>();
    for (const component of plugin.components.values()) {
      for (const binding of component.getAllBindings()) {
        bindingsIds.add(binding.id);
      }
    }

    change.impacts = {
      components: Array.from(plugin.components.keys()),
      bindings: Array.from(bindingsIds)
    };
  }

  for (const change of changes.filter(change => change.changeType === 'update')) {
    const importPlugin = imports.plugins.find(importPlugin => importPlugin.id === change.id);
    const modelPlugin = model.getPlugin(change.id);

    let componentsImpact: string[] = [];
    if (hasConfigChanges(modelPlugin, importPlugin, change)) {
      componentsImpact = Array.from(modelPlugin.components.keys());
    }

    const membersNames = getMembersChanges(modelPlugin, importPlugin, change);
    const bindingsIds = new Set<string>();
    for (const component of modelPlugin.components.values()) {
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

function lookupComponentsChangesImpacts(imports: ImportData, model: Model, changes: coreImportData.ComponentChange[]) {
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

function lookupDependencies(imports: ImportData, model: Model, changes: coreImportData.ObjectChange[]) {
  const pluginsChangesKeyById = new Map<string, string>();

  for (const change of changes.filter(change => change.objectType === 'plugin')) {
    pluginsChangesKeyById.set(change.id, change.key);
  }

  const componentsImports = new Map<string, ComponentImport>();
  for (const componentImport of imports.components) {
    componentsImports.set(componentImport.id, componentImport);
  }

  for (const change of changes.filter(change => change.objectType === 'component')) {
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
  clearComponent: (id: string) => void;
  clearBinding: (id: string) => void;
  setPlugin: (plugin: PluginImport) => void;
  setComponent: (component: ComponentImport) => void;
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
      applyImpact(impact, api, stats);
    }

    applyUpdate(update, api, stats);
  }

  log.info(`Updated (${stats.plugins} plugins, ${stats.components} components, ${stats.bindings} bindings)`);

  return stats;
}

function applyImpact(impact: Impact, api: UpdateApi, stats: BulkUpdatesStats) {
  switch (impact.type) {
    case 'binding-delete': {
      const typedImpact = impact as BindingDeleteImpact;
      log.debug(`Impact: delete plugin '${typedImpact.bindingId}'`);
      api.clearBinding(typedImpact.bindingId);
      ++stats.bindings;
      break;
    }

    case 'component-delete': {
      const typedImpact = impact as ComponentDeleteImpact;
      log.debug(`Impact: delete component '${typedImpact.componentId}'`);
      api.clearComponent(typedImpact.componentId);
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
      api.clearComponent(update.id);
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