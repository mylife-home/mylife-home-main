import { logger, components } from 'mylife-home-common';
import { pick, clone } from '../../../utils/object-utils';
import { ImportFromProjectConfig, coreImportData } from '../../../../shared/project-manager';
import { ComponentModel, Model, PluginModel } from './model';
import { Services } from '../..';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:import');

export interface ImportData {
  plugins: PluginImport[];
  components: ComponentImport[];
}

interface ComponentImport {
  id: string;
  pluginId: string;
  external: boolean;
  config: { [name: string]: any; };
}

interface PluginImport {
  id: string;
  instanceName: string;
  plugin: components.metadata.NetPlugin;
}

export function loadOnlinePlugins(): ImportData {
  const onlineService = Services.instance.online;
  const instanceNames = onlineService.getInstanceNames();
  const list: PluginImport[] = [];

  for (const instanceName of instanceNames) {
    const plugins = onlineService.getPlugins(instanceName);
    for (const onlinePlugin of plugins) {
      const plugin = components.metadata.encodePlugin(onlinePlugin);
      const id = `${instanceName}:${onlinePlugin.id}`;
      list.push({ id, instanceName, plugin });
    }
  }

  return { plugins: list, components: [] };
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

interface UpdateServerData {
  updates: Update[];
}

interface Update {
  type: 'plugin-set' | 'plugin-clear' | 'component-set' | 'component-clear';
  id: string;
  impacts: Impact[];

  newObject: PluginImport | ComponentImport;
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
  type: 'binding-delete' | 'component-delete' | 'config-update';
}

interface BindingDeleteImpact extends Impact {
  type: 'binding-delete';
  bindingId: string;
}

interface ComponentDeleteImpact extends Impact {
  type: 'component-delete';
  componentId: string;
}

interface ConfigUpdateImpact extends Impact {
  type: 'config-update';
  componentId: string;
  configName: string;
  operation: 'set-null' | 'delete';
}

export function prepareChanges(imports: ImportData, model: Model) {
  // Import composants = composants + seulement plugins associés, sans x,y
  // Gérer conflits plugins : confirmation changement + prendre toujours la version la plus haute

  // A l'affichage des elements a update:
  // plugins: on doit pouvoir selectionner facilement les nouveaux plugins, les plugins existant, les suppressions de plugins (decoche par defaut), marquer les plugins lies a des composants
  // composants: pareil: separer ajout/MAJ

  const changes = {
    plugins: preparePluginUpdates(imports, model),
    components: prepareComponentUpdates(imports, model)
  };

  lookupPluginsChangesImpacts(imports, model, changes.plugins);
  lookupComponentsChangesImpacts(imports, model, changes.components);

  const serverData: UpdateServerData = { updates: [] };

  // TODO: prepare updates

  return { changes, serverData };
}

function preparePluginUpdates(imports: ImportData, model: Model): coreImportData.PluginChanges {
  const changes = newItemChanges<coreImportData.PluginChange>();

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
    const change = newPluginChange(`plugin-set:${id}`, { version: { before: null, after: pluginImport.plugin.version } });

    change.members = lookupObjectChanges(null, pluginImport.plugin.members, memberEqualityComparer, typeChangeFormatter);
    change.config = lookupObjectChanges(null, pluginImport.plugin.config, configEqualityComparer, typeChangeFormatter);

    changes.adds[id] = change;
  }

  function update(pluginModel: PluginModel, pluginImport: PluginImport) {
    const id = pluginModel.id;
    const change = newPluginChange(`plugin-set:${id}`, { version: { before: pluginModel.data.version, after: pluginImport.plugin.version } });

    change.members = lookupObjectChanges(pluginModel.data.members, pluginImport.plugin.members, memberEqualityComparer, typeChangeFormatter);
    change.config = lookupObjectChanges(pluginModel.data.config, pluginImport.plugin.config, configEqualityComparer, typeChangeFormatter);

    changes.updates[id] = change;
  }

  function remove(pluginModel: PluginModel) {
    const id = pluginModel.id;
    const change = newPluginChange(`plugin-clear:${id}`, { version: { before: pluginModel.data.version, after: null } });
    changes.deletes[id] = change;
  }

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

function prepareComponentUpdates(imports: ImportData, model: Model): coreImportData.ComponentChanges {
  const changes = newItemChanges<coreImportData.ComponentChange>();

  for (const componentImport of imports.components) {
    const id = componentImport.id;
    if (!model.hasComponent(id)) {
      add(componentImport);
    } else {
      const componentModel = model.getComponent(id);
      if (!areComponentsEqual(componentModel, componentImport)) {
        update(componentModel, componentImport);
      }
    }
  }

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

  for (const [instanceName, set] of componentsImportsByInstanceName.entries()) {
    if(!model.hasInstance(instanceName)) {
      continue;
    }

    const instanceModel = model.getInstance(instanceName);
    for(const componentModel of instanceModel.components.values()) {
      if(!set.has(componentModel.id)) {
        remove(componentModel);
      }
    }
  }

  return changes;

  function add(componentImport: ComponentImport) {
    const id = componentImport.id;
    const change = newComponentChange(`component-set:${id}`, pick(componentImport, 'pluginId', 'external'));

    change.config = lookupObjectChanges(null, componentImport.config, Object.is, configChangeFormatter);

    changes.adds[id] = change;
  }

  function update(componentModel: ComponentModel, componentImport: ComponentImport) {
    const id = componentModel.id;
    const change = newComponentChange(`component-set:${id}`);

    if (componentModel.plugin.id !== componentImport.pluginId) {
      change.pluginId = componentImport.pluginId;
    }

    if (componentModel.data.external !== componentImport.external) {
      change.external = componentImport.external;
    }

    change.config = lookupObjectChanges(componentModel.data.config, componentImport.config, Object.is, configChangeFormatter);

    changes.updates[id] = change;
  }

  function remove(componentModel: ComponentModel) {
    const id = componentModel.id;
    const change = newComponentChange(`component-clear:${id}`);
    changes.deletes[id] = change;
  }

  function configChangeFormatter(name: string, type: coreImportData.ChangeType, valueModel: any, valueImport: any) {
    return { type, value: valueImport };
  }
}

function newItemChanges<T>() {
  const changes: coreImportData.ItemChanges<T> = {
    adds: {},
    updates: {},
    deletes: {}
  };

  return changes;
}

function newPluginChange(key: string, props: Partial<coreImportData.PluginChange> = {}) {
  const change: coreImportData.PluginChange = {
    key,
    version: { before: null, after: null },
    config: {},
    members: {},
    impacts: null,
    ...props
  };

  return change;
}

function newComponentChange(key: string, props: Partial<coreImportData.ComponentChange> = {}) {
  const change: coreImportData.ComponentChange = {
    key,
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

function lookupPluginsChangesImpacts(imports: ImportData, model: Model, changes: coreImportData.PluginChanges) {
  for (const [id, change] of Object.entries(changes.deletes)) {
    const plugin = model.getPlugin(id);
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

  for (const [id, change] of Object.entries(changes.updates)) {
    const importPlugin = imports.plugins.find(importPlugin => importPlugin.id === id);
    const modelPlugin = model.getPlugin(id);

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

function lookupComponentsChangesImpacts(imports: ImportData, model: Model, changes: coreImportData.ComponentChanges) {
  for (const [id, change] of Object.entries(changes.deletes)) {
    const component = model.getComponent(id);
    change.impacts = {
      bindings: Array.from(component.getAllBindingsIds())
    };
}

  for (const [id, change] of Object.entries(changes.updates)) {
    // only impacts on plugin change
    // TODO: could also only lookup for properties that actually changed
    if (change.pluginId) {
      const component = model.getComponent(id);
      change.impacts = {
        bindings: Array.from(component.getAllBindingsIds())
      };
    }
  }
}