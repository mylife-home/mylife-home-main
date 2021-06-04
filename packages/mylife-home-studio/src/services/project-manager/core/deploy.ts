import { components } from 'mylife-home-common';
import { ChangeType, CoreValidationError, DeployChanges, PrepareDeployToFilesCoreProjectCallResult, PrepareDeployToOnlineCoreProjectCallResult } from '../../../../shared/project-manager';
import { StoreItem, StoreItemType, ComponentConfig, BindingConfig } from '../../../../shared/core-model';
import { Services } from '../..';
import { Model, PluginModel } from './model';
import { buildPluginMembersAndConfigChanges } from './import';

export function validate(model: Model): CoreValidationError[] {
  const usedPlugins = new Map<PluginModel, string[]>();

  for (const componentId of model.getComponentsIds()) {
    const component = model.getComponent(componentId);
    if (component.data.external) {
      continue;
    }

    const plugin = component.plugin;
    let impacts = usedPlugins.get(plugin);
    if (!impacts) {
      impacts = [];
      usedPlugins.set(plugin, impacts);
    }

    impacts.push(componentId);
  }

  const onlineService = Services.instance.online;
  const errors: CoreValidationError[] = [];

  for (const [pluginModel, impacts] of usedPlugins.entries()) {
    const onlinePlugin = onlineService.findPlugin(pluginModel.instance.instanceName, `${pluginModel.data.module}.${pluginModel.data.name}`);
    if (!onlinePlugin) {
      errors.push(newValidationError(pluginModel, impacts, 'delete'));
      continue;
    }

    const plugin = components.metadata.encodePlugin(onlinePlugin);
    const changes = buildPluginMembersAndConfigChanges(pluginModel, plugin);
    if (!isObjectEmpty(changes.config) || !isObjectEmpty(changes.members)) {
      const error = newValidationError(pluginModel, impacts, 'update');
      error.config = changes.config;
      error.members = changes.members;
      errors.push(error);
    }
  }

  return errors;
}

function newValidationError(pluginModel: PluginModel, impacts: string[], changeType: ChangeType): CoreValidationError {
  return {
    instanceName: pluginModel.instance.instanceName,
    module: pluginModel.data.module,
    name: pluginModel.data.name,
    changeType,
    config: null,
    members: null,
    impacts
  };
}

interface DeployToFilesServerData {
  guessedBindingsInstanceName: string;
}

export function prepareToFiles(model: Model): PrepareDeployToFilesCoreProjectCallResult {
  const errors = validate(model);
  const bindingsInstanceName = findBindingInstance(model);
  const files = model.getInstancesNames().map(createFileName);
  const changes: DeployChanges = { bindings: [], components: [] };
  // unused for now
  const serverData: DeployToFilesServerData = { guessedBindingsInstanceName: bindingsInstanceName.actual };

  for (const bindingId of model.getBindingsIds()) {
    changes.bindings.push({ type: 'add', bindingId });
  }

  for (const componentId of model.getComponentsIds()) {
    const componentModel = model.getComponent(componentId);
    changes.components.push({ type: 'add', componentId, instanceName: componentModel.instance.instanceName });
  }

  return { errors, bindingsInstanceName, files, changes, serverData };
}

function findBindingInstance(model: Model) {
  // If there are bindings and only one instance, then use this instance as binder, else we need to ask to user for it.
  const bindingsInstanceName = {
    actual: null as string,
    needed: false
  };

  if (!model.hasBindings()) {
    return bindingsInstanceName;
  }

  const instancesNames = model.getInstancesNames();
  if (instancesNames.length === 1) {
    bindingsInstanceName.actual = instancesNames[0];
    return bindingsInstanceName;
  }

  bindingsInstanceName.needed = true;
  return bindingsInstanceName;
}

function createFileName(instanceName: string) {
  return `${instanceName}-store.json`;
}

export async function applyToFiles(model: Model, bindingsInstanceName: string, serverData: unknown) {
  const { guessedBindingsInstanceName } = serverData as DeployToFilesServerData;
  if (guessedBindingsInstanceName) {
    bindingsInstanceName = guessedBindingsInstanceName;
  }

  const storeItemsPerInstance = new Map<string, StoreItem[]>();

  for (const bindingId of model.getBindingsIds()) {
    if (!bindingsInstanceName) {
      throw new Error('Missing bindingsInstanceName');
    }

    const bindingModel = model.getBinding(bindingId);
    const bindingConfig: BindingConfig = bindingModel.data; // CoreBindingData is mutable version of BindingConfig 
    addStoreItem(bindingsInstanceName, StoreItemType.BINDING, bindingConfig);
  }

  for (const componentId of model.getComponentsIds()) {
    const componentModel = model.getComponent(componentId);
    const pluginData = componentModel.plugin.data;
    const pluginId = `${pluginData.module}.${pluginData.name}`;

    const componentConfig: ComponentConfig = {
      id: componentModel.id,
      plugin: pluginId,
      config: componentModel.data.config
    };

    addStoreItem(componentModel.instance.instanceName, StoreItemType.COMPONENT, componentConfig);
  }

  function addStoreItem(instanceName: string, type: StoreItemType, config: ComponentConfig | BindingConfig) {
    let items = storeItemsPerInstance.get(instanceName);
    if (!items) {
      items = [];
      storeItemsPerInstance.set(instanceName, items);
    }

    items.push({ type, config });
  }

  const deployService = Services.instance.deploy;

  for (const [instanceName, storeItems] of storeItemsPerInstance.entries()) {
    const file = createFileName(instanceName);
    const content = Buffer.from(JSON.stringify(storeItems, null, 2));
    await deployService.setFile(file, content);
  }
}

export function prepareToOnline(model: Model): PrepareDeployToOnlineCoreProjectCallResult {
  const errors = validate(this.model);
  if (errors.length > 0) {
    // Validation errors, cannot go further.
    return { errors, changes: null, serverData: null };
  }

  /*
  const bindingsInstances = Services.instance.online.getInstancesByCapability('bindings-api');
  if (bindingsInstances.length === 0) {
    return { deployError: `Pas d'instance de gestion de bindings en ligne pour deployer` };
  }

  if (bindingsInstances.length > 1) {
    return { deployError: 'Il y a plusieurs instances de gestion de bindings en ligne. Non supporté' };
  }
  */
 
  // une instance est toujours déployée entièrement avec un seul projet, les composants externes sont ignorés
  throw new Error('TODO');
}

export function applyToOnline(serverData: unknown) {
  throw new Error('TODO');
}

function isObjectEmpty(obj: {}) {
  return Object.keys(obj).length === 0;
}
