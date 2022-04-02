import { components } from 'mylife-home-common';
import { ChangeType, coreValidation } from '../../../../shared/project-manager';
import { Services } from '../..';
import { ComponentView, ResolvedProjectView, PluginView } from './model';
import { buildPluginMembersAndConfigChanges } from './import';

export function validate(project: ResolvedProjectView, { onlineSeverity, checkBindingApi }: { onlineSeverity: coreValidation.Severity; checkBindingApi: boolean }): coreValidation.Item[] {
  const validation: coreValidation.Item[] = [];
  validatePluginChanges(project, onlineSeverity, validation);
  validateExistingComponents(project, onlineSeverity, validation);
  validateExternalComponents(project,onlineSeverity, validation);

  if (checkBindingApi) {
    validateBindingApi(project, validation);
  }

  // Note: this are project JSON logical errors, it may only happen when manualy editing project.
  validateComponentConfigs(project, validation);
  validateBindingsConsistency(project, validation);

  return validation;
}

function validatePluginChanges(project: ResolvedProjectView, severity: coreValidation.Severity, validation: coreValidation.Item[]) {
  const usedPlugins = new Map<PluginView, string[]>();

  for (const componentId of project.getComponentsIds()) {
    const component = project.getComponent(componentId);
    if (component.external) {
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

  for (const [pluginView, impacts] of usedPlugins.entries()) {
    const onlinePlugin = onlineService.findPlugin(pluginView.instance.instanceName, `${pluginView.data.module}.${pluginView.data.name}`);
    if (!onlinePlugin) {
      validation.push(newPluginChangedValidationError(pluginView, impacts, 'delete', severity));
      continue;
    }

    const plugin = components.metadata.encodePlugin(onlinePlugin);
    const changes = buildPluginMembersAndConfigChanges(pluginView, plugin);
    if (!isObjectEmpty(changes.config) || !isObjectEmpty(changes.members)) {
      const error = newPluginChangedValidationError(pluginView, impacts, 'update', severity);
      error.config = changes.config;
      error.members = changes.members;
      validation.push(error);
    }
  }
}

function newPluginChangedValidationError(pluginView: PluginView, impacts: string[], changeType: ChangeType, severity: coreValidation.Severity): coreValidation.PluginChanged {
  return {
    type: 'plugin-changed',
    severity,
    instanceName: pluginView.instance.instanceName,
    module: pluginView.data.module,
    name: pluginView.data.name,
    changeType,
    config: null,
    members: null,
    impacts
  };
}

function validateExistingComponents(project: ResolvedProjectView, severity: coreValidation.Severity, validation: coreValidation.Item[]) {
  const onlineService = Services.instance.online;

  for (const componentId of project.getComponentsIds()) {
    const componentView = project.getComponent(componentId);
    const componentOnline = onlineService.findComponentData(componentId);

    if (!componentOnline || componentView.plugin.instance.instanceName === componentOnline.instanceName) {
      continue;
    }

    const onlinePlugin = componentOnline.component.plugin;
    const modelPlugindata = componentView.plugin.data;

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
        instanceName: componentView.plugin.instance.instanceName,
        module: modelPlugindata.module,
        name: modelPlugindata.name,
      }
    };

    validation.push(item);
  }
}

function validateExternalComponents(project: ResolvedProjectView, severity: coreValidation.Severity, validation: coreValidation.Item[]) {
  const onlineService = Services.instance.online;

  for (const componentId of project.getComponentsIds()) {
    const componentView = project.getComponent(componentId);
    if (!componentView.external) {
      continue;
    }

    const componentOnline = onlineService.findComponentData(componentView.id);
    if (!componentOnline) {
      validation.push(newBadExternalComponent(componentView, null, 'warning'));
      continue;
    }

    if (isSamePlugin(componentView, componentOnline)) {
      continue;
    }

    // only info if plugins are compatible
    const finalSeverity = arePluginsCompatible(componentView, componentOnline) ? 'info' : severity;
    validation.push(newBadExternalComponent(componentView, componentOnline, finalSeverity));
  }
}

function isSamePlugin(componentView: ComponentView, componentOnline: components.ComponentData) {
  if (componentView.plugin.instance.instanceName !== componentOnline.instanceName) {
    return false;
  }

  const pluginViewData = componentView.plugin.data;
  const pluginOnline = componentOnline.component.plugin;
  return pluginViewData.module === pluginOnline.module
      && pluginViewData.name === pluginOnline.name
      && pluginViewData.version === pluginOnline.version;
}

function arePluginsCompatible(componentView: ComponentView, componentOnline: components.ComponentData) {
  const pluginView = componentView.plugin;
  const pluginOnline = componentOnline.component.plugin;

  const plugin = components.metadata.encodePlugin(pluginOnline);
  const changes = buildPluginMembersAndConfigChanges(pluginView, plugin);
  return isObjectEmpty(changes.members);
}

function newBadExternalComponent(componentView: ComponentView, componentOnline: components.ComponentData, severity: coreValidation.Severity): coreValidation.BadExternalComponent {
  return {
    type: 'bad-external-component',
    severity,
    componentId: componentView.id,
    project: {
      instanceName: componentView.plugin.instance.instanceName,
      module: componentView.plugin.data.module,
      name: componentView.plugin.data.name,
      version: componentView.plugin.data.version,
    },
    existing: componentOnline ? {
      instanceName: componentOnline.instanceName,
      module: componentOnline.component.plugin.module,
      name: componentOnline.component.plugin.name,
      version: componentOnline.component.plugin.version,
    } : null
  };
}

function validateBindingApi(project: ResolvedProjectView, validation: coreValidation.Item[]) {
  if (project.hasBindings()) {
    const bindingsInstances = Services.instance.online.getInstancesByCapability('bindings-api');
    if (bindingsInstances.length !== 1) {
      validation.push(newInvalidBindingApi(bindingsInstances));
    }
  }
}

function newInvalidBindingApi(instanceNames: string[]): coreValidation.InvalidBindingApi {
  return {
    type: 'invalid-binding-api',
    severity: 'error',
    instanceNames
  };
}

function validateComponentConfigs(project: ResolvedProjectView, validation: coreValidation.Item[]) {
  for (const componentId of project.getComponentsIds()) {
    const component = project.getComponent(componentId);
    if (component.external) {
      continue;
    }

    const componentConfig = component.config;
    const pluginConfig = component.plugin.data.config;

    const errors: { [key: string]: string } = {};

    for (const configId of Object.keys(componentConfig)) {
      if (!pluginConfig[configId]) {
        errors[configId] = 'Extra config key';
      }
    }

    for (const configId of Object.keys(pluginConfig)) {
      const value = component.config[configId];

      try {
        component.plugin.validateConfigValue(configId, value);
      } catch(err) {
        errors[configId] = err.message;
      }
    }

    if (isObjectEmpty(errors)) {
      continue;
    }

    const item: coreValidation.ComponentBadConfig = {
      type: 'component-bad-config',
      severity: 'error',
      componentId,
      instanceName: component.plugin.instance.instanceName,
      module: component.plugin.data.module,
      name: component.plugin.data.name,
      config: errors,
    };

    validation.push(item);
  }
}

function validateBindingsConsistency(project: ResolvedProjectView, validation: coreValidation.Item[]) {
  for (const bindingId of project.getBindingsIds()) {
    const bindingModel = project.getBinding(bindingId);
    const sourceType = bindingModel.sourceComponent.plugin.data.members[bindingModel.sourceState]?.valueType;
    const targetType = bindingModel.targetComponent.plugin.data.members[bindingModel.targetAction]?.valueType;

    if (sourceType && targetType && sourceType === targetType) {
      continue;
    }

    const item: coreValidation.BindingMismatch = {
      type: 'binding-mismatch',
      severity: 'error',
      sourceComponent: bindingModel.sourceComponent.id,
      sourceState: bindingModel.sourceState,
      sourceType,
      targetComponent: bindingModel.targetComponent.id,
      targetAction: bindingModel.targetAction,
      targetType,
    };

    validation.push(item);
  }
}

function isObjectEmpty(obj: {}) {
  return Object.keys(obj).length === 0;
}

export function hasError(validation: coreValidation.Item[]) {
  return !!validation.find(item => item.severity === 'error');
}
