import { components } from 'mylife-home-common';
import { ChangeType, CoreValidationError, PrepareDeployToFilesCoreProjectCallResult, PrepareDeployToOnlineCoreProjectCallResult } from '../../../../shared/project-manager';
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
    if(!isObjectEmpty(changes.config) || !isObjectEmpty(changes.members)) {
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

export function prepareToFiles(model: Model): PrepareDeployToFilesCoreProjectCallResult {
  const errors = validate(model);

  const hasbindings = model.hasBindings();
  // If there are bindings and only one instance, then use this instance as binder, else we need to ask to user for it.
  const bindingsInstanceName = {
    actual: 'TODO',
    needed: false
  };

  

  // TODO
  throw new Error('TODO');

  // const serverData = null;

  // return { errors, bindingsInstanceName, serverData };
}

export function applyToFiles(bindingsInstanceName: string, serverData: unknown) {
  throw new Error('TODO');
}

export function prepareToOnline(model: Model): PrepareDeployToOnlineCoreProjectCallResult {
  const errors = validate(this.model);
  if (errors.length > 0) {
    // Validation errors, cannot go further.
    return { errors, changes: null, serverData: null };
  }

  // une instance est toujours déployée entièrement avec un seul projet, les composants externes sont ignorés
  throw new Error('TODO');
}

export function applyToOnline(serverData: unknown) {
  throw new Error('TODO');
}

function isObjectEmpty(obj: {}) {
  return Object.keys(obj).length === 0;
}
