import { logger } from 'mylife-home-common';
import { ConfigItem, Plugin } from '../../../../shared/component-model';
import { CoreComponentConfiguration, CoreComponentData, CorePluginData, CoreProject, CoreTemplate } from '../../../../shared/project-manager';
import { BindingModel } from './model/binding';
import { ComponentModel } from './model/component';
import { InstanceModel } from './model/instance';
import { BindingView, ComponentView, InstanceView, PluginView, ResolvedProjectView } from './model/resolved';
import { PluginModel } from './model/plugin';
import { ProjectModel } from './model/project';
import { TemplateModel } from './model/template';
import { ViewModel } from './model/view';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:resolver');

export function resolveProject(projectModel: ProjectModel): ResolvedProjectView {
  const projectView = new ResolvedProjectViewImpl();

  // Replicate instances/plugins as-this
  for (const instanceName of projectModel.getInstancesNames()) {
    // const instanceModel = projectModel.getInstance(instanceName);
    const instanceView = new InstanceViewImpl(instanceName);
    projectView.instances.set(instanceName, instanceView);
  }

  for (const pluginId of projectModel.getPluginsIds()) {
    const pluginModel = projectModel.getPlugin(pluginId);
    const instanceView = projectView.instances.get(pluginModel.instance.instanceName);
    const pluginView = new PluginViewImpl(instanceView, pluginId, pluginModel.data);

    instanceView.plugins.set(pluginView.id, pluginView);
    projectView.plugins.set(pluginView.id, pluginView);
  }

  for (const componentId of projectModel.getComponentsIds()) {
    const componentModel = projectModel.getComponent(componentId);

    if (componentModel.definition instanceof PluginModel) {
      const pluginView = projectView.getPlugin(componentModel.definition.id);
      const { config, external } = componentModel.data;
      const componentView = new ComponentViewImpl(componentId, pluginView, config, external);

      projectView.components.set(componentView.id, componentView);
      pluginView.components.set(componentView.id, componentView);

      continue;
    }
    
    if (componentModel.definition instanceof TemplateModel) {
      // TODO
      throw new Error('TODO');

      continue;
    }

    throw new Error('Unknown component definition');
  }

  for (const bindingId of projectModel.getBindingsIds()) {
    const bindingModel = projectModel.getBinding(bindingId);
    const sourceComponentView = projectView.getComponent(bindingModel.sourceComponent.id);
    const targetComponentView = projectView.getComponent(bindingModel.targetComponent.id);
    const bindingView = new BindingViewImpl(sourceComponentView, bindingModel.sourceState, targetComponentView, bindingModel.targetAction);

    projectView.bindings.set(bindingView.id, bindingView);
    sourceComponentView.bindingsFrom.add(bindingView);
    targetComponentView.bindingsTo.add(bindingView);
  }

  return projectView;
}

export class ResolvedProjectViewImpl implements ResolvedProjectView {
  readonly instances = new Map<string, InstanceViewImpl>();
  readonly plugins = new Map<string, PluginViewImpl>();
  readonly components = new Map<string, ComponentViewImpl>();
  readonly bindings = new Map<string, BindingViewImpl>();

  getPluginsIds() {
    return Array.from(this.plugins.keys());
  }

  getPlugin(id: string) {
    return this.plugins.get(id);
  }

  getComponentsIds() {
    return Array.from(this.components.keys());
  }
  
  getComponent(id: string) {
    return this.components.get(id);
  }
}

export class PluginViewImpl implements PluginView {
  readonly components = new Map<string, ComponentViewImpl>();

  constructor(
    readonly instance: InstanceView,
    readonly id: string,
    readonly data: CorePluginData
  ) {
  }
}

export class InstanceViewImpl implements InstanceView {
  readonly plugins = new Map<string, PluginViewImpl>();

  constructor(readonly instanceName: string) {
  }
}

export class ComponentViewImpl implements ComponentView {
  readonly bindingsFrom = new Set<BindingViewImpl>();
  readonly bindingsTo = new Set<BindingViewImpl>();

  constructor(
    readonly id: string,
    readonly plugin: PluginView,
    readonly config: CoreComponentConfiguration,
    readonly external: boolean,
  ) {
  }
}

export class BindingViewImpl implements BindingView {
  readonly id: string;

  constructor(
    readonly sourceComponent: ComponentView,
    readonly sourceState: string,
    readonly targetComponent: ComponentView,
    readonly targetAction: string,
  ) {
    this.id = BindingModel.makeId({
      sourceComponent: this.sourceComponent.id,
      sourceState: this.sourceState,
      targetComponent: this.targetComponent.id,
      targetAction: this.targetAction,
    });
  }
}
