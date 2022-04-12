import { logger } from 'mylife-home-common';
import { CoreComponentConfiguration, CorePluginData, CoreTemplateExports, CoreTemplateMemberExport } from '../../../../shared/project-manager';
import { BindingModel, PluginModel, ProjectModel, TemplateModel, BindingView, ComponentView, InstanceView, PluginView, ResolvedProjectView, ComponentModel, ComponentDefinitionModel, ViewModel } from './model';

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
  
  const builders: { [id: string]: ComponentBuilder } = {};

  for (const componentId of projectModel.getComponentsIds()) {
    const componentModel = projectModel.getComponent(componentId);
    const { config, external } = componentModel.data;

    builders[componentId] = ComponentBuilder.create(projectView, componentId, componentModel.definition, config, external);
  }

  buildBindings(projectView, projectModel, builders);

  return projectView;
}

abstract class ComponentBuilder {
  static create(projectView: ResolvedProjectViewImpl, componentId: string, definition: ComponentDefinitionModel, config: CoreComponentConfiguration, external: boolean) {
    if (definition instanceof PluginModel) {
      return new DirectComponentBuilder(projectView, componentId, definition, config, external);
    }
    
    if (definition instanceof TemplateModel) {
      return new TemplateBuilder(projectView, componentId, definition, config, external);
    }
  
    throw new Error('Unknown component definition');
  }

  abstract buildBindings(): void;

  abstract getMemberData(id: string): { component: ComponentViewImpl; memberName: string; }
}

class DirectComponentBuilder extends ComponentBuilder {
  private componentView: ComponentViewImpl;

  constructor(projectView: ResolvedProjectViewImpl, componentId: string, pluginModel: PluginModel, config: CoreComponentConfiguration, external: boolean) {
    super();

    const pluginView = projectView.getPlugin(pluginModel.id);
    const componentView = new ComponentViewImpl(componentId, pluginView, config, external);

    projectView.components.set(componentView.id, componentView);
    pluginView.usage.set(componentView.id, componentView);
    (pluginView.instance as InstanceViewImpl).usage.set(componentView.id, componentView);

    this.componentView = componentView;
  }

  buildBindings() {
  }

  getMemberData(id: string) {
    return { 
      component: this.componentView, 
      memberName: id
    };
  }
}

class TemplateBuilder extends ComponentBuilder {
  private readonly children: { [id: string]: ComponentBuilder } = {};

  constructor(private readonly projectView: ResolvedProjectViewImpl, componentId: string, private readonly templateModel: TemplateModel, config: CoreComponentConfiguration, external: boolean) {
    super();
    
    const configToApply = new Map<string, CoreComponentConfiguration>();

    for (const [id, item] of Object.entries(templateModel.data.exports.config)) {
      let componentConfig = configToApply.get(item.component);
      if (!componentConfig) {
        componentConfig = {};
        configToApply.set(item.component, componentConfig);
      }
  
      componentConfig[item.configName] = config[id];
    }
  
    for (const templateComponentId of templateModel.getComponentsIds()) {
      const templateComponent = templateModel.getComponent(templateComponentId);
      const id = templateComponent.id.replace('{{id}}', componentId);
      const componentConfig = { ...templateComponent.data.config, ...configToApply.get(templateComponent.id) };

      this.children[templateComponentId] = ComponentBuilder.create(projectView, id, templateComponent.definition, componentConfig, false);
    }
  }

  buildBindings() {
    buildBindings(this.projectView, this.templateModel, this.children);
  }

  getMemberData(id: string) {
    const exportData = this.templateModel.data.exports.members[id];
    const component = this.children[exportData.component];
    return component.getMemberData(exportData.member);
  }
}

function buildBindings(projectView: ResolvedProjectViewImpl, viewModel: ViewModel, builders: { [id: string]: ComponentBuilder }) {

  for (const bindingId of viewModel.getBindingsIds()) {
    const bindingModel = viewModel.getBinding(bindingId);

    const sourceHalf = builders[bindingModel.sourceComponent.id].getMemberData(bindingModel.sourceState);
    const targetHalf = builders[bindingModel.targetComponent.id].getMemberData(bindingModel.targetAction);

    const bindingView = new BindingViewImpl(sourceHalf.component, sourceHalf.memberName, targetHalf.component, targetHalf.memberName);
    projectView.bindings.set(bindingView.id, bindingView);
    sourceHalf.component.bindingsFrom.add(bindingView);
    targetHalf.component.bindingsTo.add(bindingView);
  }

  for (const builder of Object.values(builders)) {
    builder.buildBindings();
  }
}

export class ResolvedProjectViewImpl implements ResolvedProjectView {
  readonly instances = new Map<string, InstanceViewImpl>();
  readonly plugins = new Map<string, PluginViewImpl>();
  readonly components = new Map<string, ComponentViewImpl>();
  readonly bindings = new Map<string, BindingViewImpl>();

  getInstancesNames() {
    return Array.from(this.instances.keys());
  }

  getInstance(instanceName: string) {
    return checkExist(this.instances.get(instanceName));
  }

  getPluginsIds() {
    return Array.from(this.plugins.keys());
  }

  getPlugin(id: string) {
    return checkExist(this.plugins.get(id));
  }

  getComponentsIds() {
    return Array.from(this.components.keys());
  }
  
  getComponent(id: string) {
    return checkExist(this.components.get(id));
  }

  getBindingsIds() {
    return Array.from(this.bindings.keys());
  }
  
  getBinding(id: string) {
    return checkExist(this.bindings.get(id));
  }

  hasBindings() {
    return this.bindings.size > 0;
  }

  hasBinding(id: string) {
    return !!this.bindings.get(id);
  }
}

function checkExist<T>(value: T) {
  if (value) {
    return value;
  }

  throw new Error('Object not found');
}

export class PluginViewImpl implements PluginView {
  readonly usage = new Map<string, ComponentViewImpl>();

  constructor(
    readonly instance: InstanceView,
    readonly id: string,
    readonly data: CorePluginData
  ) {
  }

  validateConfigValue(configId: string, configValue: any) {
    const valueType = this.data.config[configId].valueType;
    PluginModel.validateConfigValueByType(this.id, configId, valueType, configValue);
  }
}

export class InstanceViewImpl implements InstanceView {
  readonly plugins = new Map<string, PluginViewImpl>();
  readonly usage = new Map<string, ComponentViewImpl>();

  constructor(readonly instanceName: string) {
  }

  hasNonExternalComponents() {
    for (const component of this.usage.values()) {
      if (!component.external) {
        return true;
      }
    }

    return false;
  }

  hasNonExternalComponent(id: string) {
    const component = this.usage.get(id);
    return !!component && !component.external;
  }

  *getAllNonExternalComponents() {
    for (const component of this.usage.values()) {
      if (!component.external) {
        yield component;
      }
    }
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
