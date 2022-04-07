import { logger, components } from 'mylife-home-common';
import { pick } from '../../../../utils/object-utils';
import { coreImportData } from '../../../../../shared/project-manager';
import { ComponentModel, ProjectModel, PluginModel, TemplateModel, PluginView } from '../model';
import { ImportData, PluginImport, ComponentImport } from './load';

export * from './load';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:import');

export function prepareChanges(imports: ImportData, model: ProjectModel) {
  const pluginsChanges = preparePluginUpdates(imports, model);
  const componentsChanges = prepareComponentUpdates(imports, model);

  const changes = [ ...pluginsChanges, ...componentsChanges];
  lookupDependencies(imports, model, changes);

  return changes;
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
