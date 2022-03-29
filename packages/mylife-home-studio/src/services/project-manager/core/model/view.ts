import { logger } from 'mylife-home-common';
import { MemberType } from '../../../../../shared/component-model';
import { CoreBindingData, CoreComponentData, CoreView, CoreComponentDefinition } from '../../../../../shared/project-manager';
import { BindingModel } from './binding';
import { ComponentModel } from './component';
import { ProjectModel } from './project';
import { TemplateModel } from './template';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:model');

export abstract class ViewModel {
  private readonly components = new Map<string, ComponentModel>();
  private readonly bindings = new Map<string, BindingModel>();

  abstract readonly data: CoreView;
  protected abstract readonly project: ProjectModel;

  private get template(): TemplateModel {
    return (this instanceof TemplateModel) ? this : null;
  }

  // call after project ctor
  protected init() {
    for (const [id, componentData] of Object.entries(this.data.components)) {
      this.registerComponent(id, componentData);
    }

    for (const [id, bindingData] of Object.entries(this.data.bindings)) {
      const binding = this.registerBinding(bindingData);

      if (binding.id !== id) {
        log.error(`Binding id mismatch: '${binding.id}' != '${id}'`);
      }
    }
  }

  protected registerComponent(id: string, componentData: CoreComponentData) {
    const plugin = this.project.getPlugin(componentData.plugin);
    const { instance } = plugin;
    const component = new ComponentModel(instance, plugin, this.template, id, componentData);

    this.components.set(component.id, component);
    plugin.registerUsage(component);
    instance.registerUsage(component);

    return component;
  }

  protected registerBinding(bindingData: CoreBindingData) {
    const sourceComponent = this.getComponent(bindingData.sourceComponent);
    const targetComponent = this.getComponent(bindingData.targetComponent);
    const binding = new BindingModel(this.template, bindingData, sourceComponent, targetComponent);

    this.bindings.set(binding.id, binding);
    sourceComponent.registerBinding(binding);
    targetComponent.registerBinding(binding);

    return binding;
  }
  
  getComponentsIds() {
    return Array.from(this.components.keys());
  }

  hasComponent(id: string) {
    return this.components.has(id);
  }

  findComponent(id: string) {
    return this.components.get(id);
  }

  getComponent(id: string) {
    const component = this.components.get(id);
    if (!component) {
      throw new Error(`Component '${id}' does not exist`);
    }

    return component;
  }

  setComponent(componentId: string, definition: CoreComponentDefinition, x: number, y: number) {
    if (this.hasComponent(componentId)) {
      throw new Error(`Component id already exists: '${componentId}'`);
    }

    const plugin = this.project.getPlugin(pluginId);

    const componentData: CoreComponentData = {
      plugin: pluginId,
      position: { x, y },
      config: plugin.createConfigTemplate(),
      external: false,
    };

    const component = this.registerComponent(componentId, componentData);
    this.data.components[component.id] = component.data;

    return component;
  }

  renameComponent(id: string, newId: string) {
    if (this.hasComponent(newId)) {
      throw new Error(`Component id already exists: '${newId}'`);
    }

    const component = this.components.get(id);
    const plugin = component.plugin;
    const instance = component.instance;

    this.components.delete(component.id);
    plugin.unregisterUsage(component.id);
    instance.unregisterUsage(component.id);
    delete this.data.components[component.id];

    component.rename(newId);

    this.components.set(component.id, component);
    plugin.registerUsage(component);
    instance.registerUsage(component);
    this.data.components[component.id] = component.data;

    for (const binding of component.getAllBindings()) {
      this.bindings.delete(binding.id);
      delete this.data.bindings[binding.id];
      binding.rebuild();
      this.bindings.set(binding.id, binding);
      this.data.bindings[binding.id] = binding.data;
    }
  }

  clearComponent(id: string) {
    const component = this.components.get(id);

    const plugin = component.plugin;
    const instance = component.instance;

    this.components.delete(component.id);
    plugin.unregisterUsage(component.id);
    instance.unregisterUsage(component.id);

    delete this.data.components[component.id];
  }

  hasBindings() {
    return this.bindings.size > 0;
  }

  hasBinding(id: string) {
    return !!this.bindings.get(id);
  }

  getBinding(id: string) {
    const binding = this.bindings.get(id);
    if (!binding) {
      throw new Error(`Binding '${id}' does not exist`);
    }

    return binding;
  }

  getBindingsIds() {
    return Array.from(this.bindings.keys());
  }

  setBinding(bindingData: CoreBindingData) {
    const sourceComponent = this.getComponent(bindingData.sourceComponent);
    const targetComponent = this.getComponent(bindingData.targetComponent);

    if (sourceComponent === targetComponent) {
      throw new Error('Cannot create binding on self');
    }

    const sourceType = sourceComponent.plugin.getMemberType(bindingData.sourceState, MemberType.STATE);
    const targetType = targetComponent.plugin.getMemberType(bindingData.targetAction, MemberType.ACTION);
    if (sourceType !== targetType) {
      throw new Error(`Cannot create binding from '${sourceType}' to '${targetType}'`);
    }

    const candidateId = BindingModel.makeId(bindingData);
    if (this.hasBinding(candidateId)) {
      throw new Error(`Binding id already exists: '${candidateId}'`);
    }

    const binding = this.registerBinding(bindingData);
    this.data.bindings[binding.id] = binding.data;
    return binding;
  }

  clearBinding(id: string) {
    const binding = this.bindings.get(id);

    this.bindings.delete(binding.id);
    binding.sourceComponent.unregisterBinding(binding);
    binding.targetComponent.unregisterBinding(binding);

    delete this.data.bindings[binding.id];
  }
}
