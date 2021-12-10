import { logger } from 'mylife-home-common';
import { ChangeType, DeployChanges, PrepareDeployToFilesCoreProjectCallResult, PrepareDeployToOnlineCoreProjectCallResult } from '../../../../shared/project-manager';
import { StoreItem, StoreItemType, ComponentConfig, BindingConfig } from '../../../../shared/core-model';
import { Services } from '../..';
import { BindingModel, ComponentModel, Model } from './model';
import { validate, hasError } from './validation';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:deploy');

interface DeployToFilesServerData {
  guessedBindingsInstanceName: string;
}

export function prepareToFiles(model: Model): PrepareDeployToFilesCoreProjectCallResult {
  const validation = validate(model, { onlineSeverity: 'warning' });
  if (hasError(validation)) {
    // Validation errors, cannot go further.
    return { validation, bindingsInstanceName: null, files: null, changes: null, serverData: null };
  }

  const usedInstancesNamesSet = new Set<string>();
  const changes: DeployChanges = { bindings: [], components: [] };

  for (const componentId of model.getComponentsIds()) {
    const componentModel = model.getComponent(componentId);
    if (componentModel.data.external) {
      continue;
    }
    const { instanceName } = componentModel.instance;
    changes.components.push({ type: 'add', componentId, instanceName });
    usedInstancesNamesSet.add(instanceName);
  }

  const usedInstancesNames = Array.from(usedInstancesNamesSet);
  const bindingsInstanceName = findBindingInstance(model, usedInstancesNames);
  
  for (const bindingId of model.getBindingsIds()) {
    changes.bindings.push({ instanceName: bindingsInstanceName.actual, type: 'add', bindingId });
  }

  const files = usedInstancesNames.map(createFileName);
  const serverData: DeployToFilesServerData = { guessedBindingsInstanceName: bindingsInstanceName.actual };

  return { validation, bindingsInstanceName, files, changes, serverData };
}

function findBindingInstance(model: Model, usedInstancesNames: string[]) {
  // If there are bindings and only one instance, then use instance as binder, else we need to ask to user for it.
  const bindingsInstanceName = {
    actual: null as string,
    needed: false
  };

  if (!model.hasBindings()) {
    return bindingsInstanceName;
  }

  if (usedInstancesNames.length === 1) {
    bindingsInstanceName.actual = usedInstancesNames[0];
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
    if (componentModel.data.external) {
      continue;
    }

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

  let writtenFilesCount = 0;

  log.info('Deploying to files');

  for (const [instanceName, storeItems] of storeItemsPerInstance.entries()) {
    const file = createFileName(instanceName);
    const content = Buffer.from(JSON.stringify(storeItems, null, 2));
    await deployService.setFile(file, content);
    ++writtenFilesCount;

    log.info(`File written: '${file}'`);
  }

  log.info('Deployed to files');

  return writtenFilesCount;
}

interface DeployToOnlineServerData {
  tasks: OnlineTask[];
}

interface OnlineTask {
  instanceName: string;
  changeType: ChangeType; // cannot update
  objectType: 'component' | 'binding';
  objectId: string;
}

export async function prepareToOnline(model: Model): Promise<PrepareDeployToOnlineCoreProjectCallResult> {
  const validation = validate(model, { onlineSeverity: 'error' });
  if (hasError(validation)) {
    // Validation errors, cannot go further.
    return { validation, changes: null, serverData: null };
  }

  const bindingsDelete: OnlineTask[] = [];
  const bindingsAdd: OnlineTask[] = [];
  const componentsDelete: OnlineTask[] = [];
  const componentsAdd: OnlineTask[] = [];
  const changes: DeployChanges = { bindings: [], components: [] };
  const onlineService = Services.instance.online;

  if (model.hasBindings()) {
    const bindingsInstances = Services.instance.online.getInstancesByCapability('bindings-api');
    if (bindingsInstances.length === 0) {
      throw new Error(`Pas d'instance de gestion de bindings en ligne pour deployer`);
    }

    if (bindingsInstances.length > 1) {
      throw new Error('Il y a plusieurs instances de gestion de bindings en ligne. Non supporté');
    }

    const instanceName = bindingsInstances[0];

    const onlineBindings = new Map<string, BindingConfig>();
    for(const onlineBinding of await onlineService.coreListBindings(instanceName)) {
      onlineBindings.set(BindingModel.makeId(onlineBinding), onlineBinding);
    }

    for (const bindingId of onlineBindings.keys()) {
      if (!model.hasBinding(bindingId)) {
        changes.bindings.push({ instanceName, type: 'delete', bindingId });
        bindingsDelete.push({ instanceName, changeType: 'delete', objectType: 'binding', objectId: bindingId });
      }
    }

    for (const bindingId of model.getBindingsIds()) {
      if(!onlineBindings.has(bindingId)) {
        changes.bindings.push({ instanceName, type: 'add', bindingId });
        bindingsAdd.push({ instanceName, changeType: 'add', objectType: 'binding', objectId: bindingId });
      }
    }
  }

  // une instance est toujours déployée entièrement avec un seul projet, les composants externes sont ignorés
  for (const instanceName of model.getInstancesNames()) {
    const instance = model.getInstance(instanceName);
    if (!instance.hasNonExternalComponents()) {
      continue;
    }

    const onlineComponents = new Map<string, ComponentConfig>();
    for (const onlineComponent of await onlineService.coreListComponents(instanceName)) {
      onlineComponents.set(onlineComponent.id, onlineComponent);
    }

    for (const componentId of onlineComponents.keys()) {
      if (!instance.hasNonExternalComponent(componentId)) {
        changes.components.push({ instanceName, type: 'delete', componentId });
        componentsDelete.push({ instanceName, changeType: 'delete', objectType: 'component', objectId: componentId });
      }
    }

    for (const componentModel of instance.components.values()) {
      if (componentModel.data.external) {
        continue;
      }

      const componentId = componentModel.id;
      const onlineComponent = onlineComponents.get(componentId);
      if (!onlineComponent) {
        // create only
        changes.components.push({ instanceName, type: 'add', componentId });
        componentsAdd.push({ instanceName, changeType: 'add', objectType: 'component', objectId: componentId });
        continue;
      }

      if (areComponentsEqual(componentModel, onlineComponent)) {
        continue;
      }

      // update: delete and create
      changes.components.push({ instanceName, type: 'update', componentId });
      componentsDelete.push({ instanceName, changeType: 'delete', objectType: 'component', objectId: componentId });
      componentsAdd.push({ instanceName, changeType: 'add', objectType: 'component', objectId: componentId });
    }
  }

  const tasks = [...bindingsDelete, ...componentsDelete, ...componentsAdd, ...bindingsAdd];
  const serverData: DeployToOnlineServerData = { tasks };
  return { validation, changes, serverData };
}

function areComponentsEqual(componentModel: ComponentModel, componentOnline: ComponentConfig) {
  const modelPluginData = componentModel.plugin.data;
  const modelPluginId = `${modelPluginData.module}.${modelPluginData.name}`;
  const baseEqual = componentModel.id === componentOnline.id
    && modelPluginId === componentOnline.plugin
    && !!componentModel.data.config === !!componentOnline.config;

  if (!baseEqual) {
    return false;
  }

  // compare config
  const configModel = componentModel.data.config;
  const configOnline = componentOnline.config;

  const modelKeys = Object.keys(configModel);
  const configKeys = Object.keys(configOnline);
  if (modelKeys.length !== configKeys.length) {
    return false;
  }

  for (const [key, valueModel] of Object.entries(configModel)) {
    if (!configOnline.hasOwnProperty(key)) {
      return false;
    }

    const valueOnline = configOnline[key];

    if (!Object.is(valueModel, valueOnline)) {
      return false;
    }
  }

  return true;
}

export async function applyToOnline(model: Model, serverData: unknown) {
  const { tasks } = serverData as DeployToOnlineServerData;
  
  log.info('Deploying to online');

  const instancesNames = new Set<string>();

  for (const task of tasks) {
    instancesNames.add(task.instanceName);
    await executeOnlineTask(model, task);
  }

  const onlineService = Services.instance.online;
  for (const instanceName of instancesNames) {
    await onlineService.coreStoreSave(instanceName);
    log.info(`Store save on instance '${instanceName}'`);
  }

  log.info('Deployed to online');
}

async function executeOnlineTask(model: Model, task: OnlineTask) {
  const onlineService = Services.instance.online;

  switch (task.objectType) {
    case 'binding':
      switch(task.changeType) {
        case 'add':
          await onlineService.coreAddBinding(task.instanceName, createBindingConfig(task.objectId));
          log.info(`Binding '${task.objectId}' added on instance '${task.instanceName}'`);
          break;
        case 'delete':
          await onlineService.coreRemoveBinding(task.instanceName, createBindingConfig(task.objectId));
          log.info(`Binding '${task.objectId}' deleted on instance '${task.instanceName}'`);
          break;
      }
      break;

    case 'component':
      switch(task.changeType) {
        case 'add':
          await onlineService.coreAddComponent(task.instanceName, createComponentConfig(model, task.objectId));
          log.info(`Component '${task.objectId}' added on instance '${task.instanceName}'`);
          break;
        case 'delete':
          await onlineService.coreRemoveComponent(task.instanceName, task.objectId);
          log.info(`Component '${task.objectId}' deleted on instance '${task.instanceName}'`);
          break;
      }
      break;
  }

  log.info(`Executed task '${task.changeType}' '${task.objectType}' '${task.objectId}' on instance '${task?.instanceName}'`);
}

function createComponentConfig(model: Model, id: string): ComponentConfig {
  const componentModel = model.getComponent(id);
  const pluginData = componentModel.plugin.data;
  return {
    id,
    plugin: `${pluginData.module}.${pluginData.name}`,
    config: componentModel.data.config
  };
}

function createBindingConfig(id: string): BindingConfig {
  //return `${data.sourceComponent}:${data.sourceState}:${data.targetComponent}:${data.targetAction}`;
  const [sourceComponent, sourceState, targetComponent, targetAction] = id.split(':');
  if (!sourceComponent || !sourceState || !targetComponent || !targetAction) {
    throw new Error(`Could not parse binding id '${id}'`);
  }

  return { sourceComponent, sourceState, targetComponent, targetAction };
}
