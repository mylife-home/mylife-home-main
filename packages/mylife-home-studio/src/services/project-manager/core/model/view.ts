import { logger } from 'mylife-home-common';
import { MemberType } from '../../../../../shared/component-model';
import { CoreBindingData, CoreComponentData, CoreView, CoreComponentDefinition } from '../../../../../shared/project-manager';
import { ComponentDefinitionModel, ComponentModel, BindingModel, TemplateModel, ProjectModel } from '.';
import { validateId } from './id-validator';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:model');

/**
 * Common base of template and project
 */
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

  private getDefinition(data: CoreComponentDefinition): ComponentDefinitionModel {
    switch (data.type) {
      case 'plugin':
        return this.project.getPlugin(data.id);

      case 'template':
        return this.project.getTemplate(data.id);
    }
  }

  protected registerComponent(id: string, componentData: CoreComponentData) {
    const definition = this.getDefinition(componentData.definition);

    const component = new ComponentModel(definition, this.template, id, componentData);

    this.components.set(component.id, component);
    definition.registerUsage(component);

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

  hasComponents() {
    return this.components.size > 0;
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

    validateId(componentId);

    const definitionModel = this.getDefinition(definition);

    const dryRun = this.project.buildNamingDryRunEngine();
    dryRun.setComponent(this, componentId, definitionModel);
    dryRun.validate();

    const componentData: CoreComponentData = {
      definition,
      position: { x, y },
      config: definitionModel.createConfigTemplate(),
      external: false,
    };

    const component = this.registerComponent(componentId, componentData);
    this.data.components[component.id] = component.data;

    return component;
  }

  private unsafeSetComponent(componentId: string, componentData: CoreComponentData) {
    const component = this.registerComponent(componentId, componentData);
    this.data.components[component.id] = component.data;

    return component;
  }

  renameComponent(id: string, newId: string) {
    if (this.hasComponent(newId)) {
      throw new Error(`Component id already exists: '${newId}'`);
    }

    validateId(newId);

    const component = this.components.get(id);

    const dryRun = this.project.buildNamingDryRunEngine();
    dryRun.renameComponent(component, newId);
    dryRun.validate();

    const { definition } = component;

    this.components.delete(component.id);
    definition.unregisterUsage(component.id);
    delete this.data.components[component.id];

    component.rename(newId);

    this.components.set(component.id, component);
    definition.registerUsage(component);
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
    const { definition } = component;

    this.components.delete(component.id);
    definition.unregisterUsage(component.id);
    delete this.data.components[component.id];
  }

  copyTo(componentsIds: string[], targetView: ViewModel) {
    if (this === targetView) {
      throw new Error('Cannot copy on self');
    }

    // fill source
    const components = new Set(componentsIds.map(id => this.getComponent(id)));
    const bindings = new Set<BindingModel>();

    // find all bindings between selected components
    for (const component of components) {
      for (const binding of component.getAllBindings()) {
        if (components.has(binding.sourceComponent) && components.has(binding.targetComponent)) {
          bindings.add(binding);
        } 
      }
    }

    // sanity checks
    const dryRun = this.project.buildNamingDryRunEngine();

    for (const component of components) {
      const targetId = `{{id}}-${component.id}`;

      if (component.data.external) {
        throw new Error('Cannot copy external components');
      } else if (component.definition instanceof TemplateModel) {
        throw new Error('Cannot copy template components for now');
      } else if (targetView.hasComponent(targetId)) {
        throw new Error(`Component with id '${targetId}' does already exist on target view`);
      }

      dryRun.setComponent(targetView, targetId, component.definition);
    }

    dryRun.validate();

    // map of source -> target
    const componentsLinks = new Map<ComponentModel, ComponentModel>();
    const bindingsLinks = new Map<BindingModel, BindingModel>();

    for (const sourceComponent of components) {
      const data: CoreComponentData = {
        definition: { ...sourceComponent.data.definition },
        position: { ...sourceComponent.data.position },
        config: { ...sourceComponent.data.config },
        external: false
      };

      const targetComponent = targetView.unsafeSetComponent(`{{id}}-${sourceComponent.id}`, data);
      componentsLinks.set(sourceComponent, targetComponent);
    }

    for (const sourceBinding of bindings) {
      const targetBinding = targetView.setBinding({
        sourceComponent: componentsLinks.get(sourceBinding.sourceComponent).id,
        sourceState: sourceBinding.sourceState,
        targetComponent: componentsLinks.get(sourceBinding.targetComponent).id,
        targetAction: sourceBinding.targetAction,
      });
      
      bindingsLinks.set(sourceBinding, targetBinding);
    }

    return {
      components: Array.from(componentsLinks.values()),
      bindings: Array.from(bindingsLinks.values()),
    };
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

    const sourceType = sourceComponent.definition.getMemberValueType(bindingData.sourceState, MemberType.STATE);
    const targetType = targetComponent.definition.getMemberValueType(bindingData.targetAction, MemberType.ACTION);
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
