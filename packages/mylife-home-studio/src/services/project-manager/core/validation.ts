import { components } from 'mylife-home-common';
import { ChangeType, coreValidation } from '../../../../shared/project-manager';
import { Services } from '../..';
import { Model, PluginModel } from './model';
import { buildPluginMembersAndConfigChanges } from './import';

export function validate(model: Model, { onlineSeverity }: { onlineSeverity: coreValidation.Severity }): coreValidation.Item[] {
  const validation: coreValidation.Item[] = [];
  validatePluginChanges(model, onlineSeverity, validation);
  validateExistingComponents(model, onlineSeverity, validation);
  // TODO: other validation items
  return validation;
}

function validatePluginChanges(model: Model, severity: coreValidation.Severity, validation: coreValidation.Item[]) {
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

  for (const [pluginModel, impacts] of usedPlugins.entries()) {
    const onlinePlugin = onlineService.findPlugin(pluginModel.instance.instanceName, `${pluginModel.data.module}.${pluginModel.data.name}`);
    if (!onlinePlugin) {
      validation.push(newPluginChangedValidationError(pluginModel, impacts, 'delete', severity));
      continue;
    }

    const plugin = components.metadata.encodePlugin(onlinePlugin);
    const changes = buildPluginMembersAndConfigChanges(pluginModel, plugin);
    if (!isObjectEmpty(changes.config) || !isObjectEmpty(changes.members)) {
      const error = newPluginChangedValidationError(pluginModel, impacts, 'update', severity);
      error.config = changes.config;
      error.members = changes.members;
      validation.push(error);
    }
  }
}

function newPluginChangedValidationError(pluginModel: PluginModel, impacts: string[], changeType: ChangeType, severity: coreValidation.Severity): coreValidation.PluginChanged {
  return {
    type: 'plugin-changed',
    severity,
    instanceName: pluginModel.instance.instanceName,
    module: pluginModel.data.module,
    name: pluginModel.data.name,
    changeType,
    config: null,
    members: null,
    impacts
  };
}

function isObjectEmpty(obj: {}) {
  return Object.keys(obj).length === 0;
}

function validateExistingComponents(model: Model, severity: coreValidation.Severity, validation: coreValidation.Item[]) {
  const onlineService = Services.instance.online;

  for (const componentId of model.getComponentsIds()) {
    const componentModel = model.getComponent(componentId);
    const componentOnline = onlineService.findComponentData(componentId);

    if (componentModel.instance.instanceName === componentOnline.instanceName) {
      continue;
    }

    const onlinePlugin = componentOnline.component.plugin;
    const modelPlugindata = componentModel.plugin.data;

    const item: coreValidation.ExistingComponentId = {
      type: 'existing-component-id',
      severity,
      componentId,
      existing: {
        instanceName: componentOnline.instanceName,
        module: onlinePlugin.module,
        name: onlinePlugin.name,
      },
      project: {
        instanceName: componentModel.instance.instanceName,
        module: modelPlugindata.module,
        name: modelPlugindata.name,
      }
    };

    validation.push(item);
  }
}

export function hasError(validation: coreValidation.Item[]) {
  return !!validation.find(item => item.severity === 'error');
}
