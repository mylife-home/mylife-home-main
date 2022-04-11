import { logger } from 'mylife-home-common';
import { coreImportData } from '../../../../../shared/project-manager';
import { ProjectModel, PluginModel, TemplateModel, BindingModel, ComponentModel } from '../model';
import { ImportData, PluginImport, ComponentImport } from './load';
import { Update, PluginSetUpdate, PluginClearUpdate, ComponentSetUpdate, ComponentClearUpdate, ComponentConfigUpdate, BindingClearUpdate, TemplateClearExportsUpdate, UpdateServerData } from './update-types';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:import');

class ComputeContext {
  private readonly updates = new Map<string, Update>();
  currentObjectChangeKey: string;

  constructor(readonly model: ProjectModel) {
  }

  ensureUpdate<TUpdate extends Update>(id: string, creator: (builder: UpdateBuilder<TUpdate>) => void) {
    let update = this.updates.get(id);
    if (!update) {
      const builder = new UpdateBuilder<TUpdate>(id);
      creator(builder);
      update = builder.build();
      this.updates.set(id, update);
    }

    this.addObjectKey(id);

    return id;
  }

  private addObjectKey(updateId: string) {
    const update = this.updates.get(updateId);

    if (!update.objectChangeKeys.includes(this.currentObjectChangeKey)) {
      update.objectChangeKeys.push(this.currentObjectChangeKey);

      for (const dependency of update.dependencies) {
        this.addObjectKey(dependency);
      }
    }
  }
  
  copyObjectChangeKey(sourceKey: string, targetKey: string) {
    for (const update of this.updates.values()) {
      if (update.objectChangeKeys.includes(sourceKey) && !update.objectChangeKeys.includes(targetKey)) {
        update.objectChangeKeys.push(targetKey);
      }
    }
  }

  *getAllObjectUpdates(changeKey: string) {
    for (const update of this.updates.values()) {
      if (update.objectChangeKeys.includes(changeKey)) {
        yield update;
      }
    }
  }

  build() {
    return Array.from(this.updates.values());
  }
}

class UpdateBuilder<TUpdate extends Update> {
  private update: TUpdate;

  constructor(private readonly id: string) {
  }

  init(update: Omit<TUpdate, 'id' | 'objectChangeKeys' | 'dependencies'>) {
    this.update = {
      ...update,
      id: this.id,
      objectChangeKeys: [],
      dependencies: []
    } as TUpdate;
  }

  addDependencies(updateIds: string[]) {
    for (const updateId of updateIds) {
      this.update.dependencies.push(updateId);
    }
  }

  build() {
    return this.update;
  }
}

class DependenciesBuilder {
  private readonly dependencies: string[];

  addDependencies(updateIds: string[]) {
    for (const updateId of updateIds) {
      this.dependencies.push(updateId);
    }
  }

  build() {
    return this.dependencies;
  }
}

export function buildUpdates(imports: ImportData, model: ProjectModel, changes: coreImportData.ObjectChange[]) {
  const context = new ComputeContext(model);

  computeUpdates(context, imports, changes);
  computeObjectImpacts(context, changes);
  applyObjectDependencies(context, changes);

  const serverData: UpdateServerData = { updates: context.build() };
  return serverData;
}

function computeUpdates(context: ComputeContext, imports: ImportData, changes: coreImportData.ObjectChange[]) {
  for (const change of changes) {
    const fullChangeType = `${change.objectType}.${change.changeType}`;
    context.currentObjectChangeKey = change.key;

    switch (fullChangeType) {
      case 'component.add':
      case 'component.update': {
        const importData = imports.components.find(item => item.id === change.id);
        computeComponentSet(context, importData);
        break;
      }

      case 'component.delete': {
        const component = context.model.getComponent(change.id);
        computeComponentDelete(context, component);
        break;
      }

      case 'plugin.add':
      case 'plugin.update': {
        const importData = imports.plugins.find(item => item.id === change.id);
        computePluginSet(context, importData, change as coreImportData.PluginChange);
        break;
      }

      case 'plugin.delete': {
        const plugin = context.model.getPlugin(change.id);
        computePluginDelete(context, plugin);
        break;
      }

      case 'template.update': {
        // this is the root operation, so on config unexport we must reset component config
        const template = context.model.getTemplate(change.id);
        const typedChange = change as coreImportData.TemplateChange;

        if (typedChange.exportType === 'config') {
          const { component: componentId, configName } = template.data.exports.config[typedChange.exportId];
          const component = template.getComponent(componentId);
          // No check, else reset will be applied on template usage.
          // This is not what we want, we want direct update because we will remove export
          computeComponentResetConfigUnsafe(context, component, configName);
        }

        computeTemplateExportDelete(context, template, typedChange.exportType, typedChange.exportId);
        break;
      }

      case 'template.add':
      case 'template.delete':
      default:
        throw new Error(`Change type '${change.changeType}' on object type '${change.objectType}' is not supported.`);
    }
  }
}

function computePluginSet(context: ComputeContext, importData: PluginImport, change: coreImportData.PluginChange) {
  const updateId = `plugin-set:${importData.id}`;
  
  return [context.ensureUpdate<PluginSetUpdate>(updateId, (builder) => {

    builder.init({
      type: 'plugin-set',
      plugin: importData,
    });

    if (change.changeType === 'update') {
      const plugin = context.model.getPlugin(change.id);
      const components = Array.from(plugin.getAllUsage());

      for (const [id, type] of Object.entries(change.config)) {
        switch(type) {
          case 'add':
          case 'update':
            for (const component of components) {
              builder.addDependencies(computeComponentResetConfig(context, component, id));
            }

            break;

          case 'delete':
            for (const component of components) {
              builder.addDependencies(computeComponentClearConfig(context, component, id));
            }

            break;
        }
      }

      for (const [id, type] of Object.entries(change.members)) {
        switch (type) {
          // no impact on add
          case 'update': {
            const actualMember = plugin.getMember(id);
            const newMember = importData.plugin.members[id];
            if (actualMember.memberType !== newMember.memberType || actualMember.valueType !== newMember.valueType) {
              for (const component of components) {
                builder.addDependencies(computeComponentClearMember(context, component, id));
              }
            }
            break;
          }
            
          case 'delete':
            for (const component of components) {
              builder.addDependencies(computeComponentClearMember(context, component, id));
            }

            break;
        }
      }
    }
  })];
}

function computePluginDelete(context: ComputeContext, plugin: PluginModel) {
  const updateId = `plugin-clear:${plugin.id}`;

  return [context.ensureUpdate<PluginClearUpdate>(updateId, (builder) => {

    builder.init({
      type: 'plugin-clear',
      pluginId: plugin.id,
    });

    for (const component of plugin.getAllUsage()) {
      builder.addDependencies(computeComponentDelete(context, component));
    }
  })];
}

function computeComponentSet(context: ComputeContext, importData: ComponentImport) {
  // check that it will not overwrite a template instantiation. If so, there is nothing to do, fail instantly
  if (context.model.hasComponent(importData.id)) {
    // will be an update
  } else {
    const dryRun = context.model.buildNamingDryRunEngine();
    dryRun.setComponent(context.model, importData.id, null);
    dryRun.validate();
  }

  const updateId = `component-set::${importData.id}`;

  return [context.ensureUpdate<ComponentSetUpdate>(updateId, (builder) => {

    builder.init({
      type: 'component-set',
      component: importData,
    });
  })];
}

function computeComponentClearConfig(context: ComputeContext, component: ComponentModel, configId: string) {
  const updateId = `component-clear-config:${component.ownerTemplate?.id || ''}:${component.id}:${configId}`;

  return [context.ensureUpdate<ComponentConfigUpdate>(updateId, (builder) => {

    builder.init({
      type: 'component-clear-config',
      templateId: component.ownerTemplate?.id || null,
      componentId: component.id,
      configId,
    });

    if (component.ownerTemplate) {
      const template = component.ownerTemplate;

      for (const [id, item] of Object.entries(template.data.exports.config)) {
        if (item.component === component.id && item.configName === configId) {
          builder.addDependencies(computeTemplateExportDelete(context, template, 'config', id));
        }
      }
    }
  })];
}

function computeComponentResetConfig(context: ComputeContext, component: ComponentModel, configId: string) {
  // if component config is exported, then there no component reset, but template usage reset
  if (component.ownerTemplate) {
    const template = component.ownerTemplate;
    const templateConfigId = template.findConfigExported(component.id, configId);
    if (templateConfigId) {
      // in fact reset all components config that uses this template
      const dependencies = new DependenciesBuilder();

      for (const component of template.getAllUsage()) {
        dependencies.addDependencies(computeComponentResetConfig(context, component, templateConfigId));
      }

      return dependencies.build();
    }
  }

  return computeComponentResetConfigUnsafe(context, component, configId);
}

// Only create the reset, without checks
function computeComponentResetConfigUnsafe(context: ComputeContext, component: ComponentModel, configId: string) {
  const updateId = `component-reset-config:${component.ownerTemplate?.id || ''}:${component.id}:${configId}`;

  return [context.ensureUpdate<ComponentConfigUpdate>(updateId, (builder) => {

    builder.init({
      type: 'component-reset-config',
      templateId: component.ownerTemplate?.id || null,
      componentId: component.id,
      configId,
    });
  })];
}

function computeComponentClearMember(context: ComputeContext, component: ComponentModel, memberName: string) {
  // not directly an update, but can lead to updates on bindings/templates
  const dependencies = new DependenciesBuilder();

  for (const binding of component.getAllBindingsWithMember(memberName)) {
    dependencies.addDependencies(computeBindingDelete(context, binding));
  }

  if (component.ownerTemplate) {
    const template = component.ownerTemplate;

    for (const [id, item] of Object.entries(template.data.exports.members)) {
      if (item.component === component.id && item.member === memberName) {
        dependencies.addDependencies(computeTemplateExportDelete(context, template, 'member', id));
      }
    }
  }

  return dependencies.build();
}

function computeComponentDelete(context: ComputeContext, component: ComponentModel) {
  const updateId = `component-clear:${component.ownerTemplate?.id || ''}:${component.id}`;

  return [context.ensureUpdate<ComponentClearUpdate>(updateId, (builder) => {

    builder.init({
      type: 'component-clear',
      templateId: component.ownerTemplate?.id || null,
      componentId: component.id,
    });

    for (const binding of component.getAllBindings()) {
      builder.addDependencies(computeBindingDelete(context, binding));
    }

    if (component.ownerTemplate) {
      const template = component.ownerTemplate;

      for (const [id, item] of Object.entries(template.data.exports.config)) {
        if (item.component === component.id) {
          builder.addDependencies(computeTemplateExportDelete(context, template, 'config', id));
        }
      }

      for (const [id, item] of Object.entries(template.data.exports.members)) {
        if (item.component === component.id) {
          builder.addDependencies(computeTemplateExportDelete(context, template, 'member', id));
        }
      }
    }
  })];
}

function computeBindingDelete(context: ComputeContext, binding: BindingModel) {
  const updateId = `binding-clear:${binding.ownerTemplate?.id || ''}:${binding.id}`;

  return [context.ensureUpdate<BindingClearUpdate>(updateId, (builder) => {

    builder.init({
      type: 'binding-clear',
      templateId: binding.ownerTemplate?.id || null,
      bindingId: binding.id,
    });
  })];
}

function computeTemplateExportDelete(context: ComputeContext, template: TemplateModel, exportType: 'config' | 'member', exportId: string) {
  const updateId = `template-clear-export:${template.id}:${exportType}:${exportId}`;

  return [context.ensureUpdate<TemplateClearExportsUpdate>(updateId, (builder) => {

    builder.init({
      type: 'template-clear-export',
      templateId: template.id,
      exportType,
      exportId,
    });

    const components = Array.from(template.getAllUsage());

    switch (exportType) {
      case 'config':
        for (const component of components) {
          builder.addDependencies(computeComponentClearConfig(context, component, exportId));
        }

        break;

      case 'member':
        for (const component of components) {
          builder.addDependencies(computeComponentClearMember(context, component, exportId));
        }

        break;
    }
  })];
}

function applyObjectDependencies(context: ComputeContext, changes: coreImportData.ObjectChange[]) {
  // 2nd pass: also select on objectChangeKeys objectChange dependencies
  // eg: on component set, also select plugin set

  for (const change of changes) {
    for (const sourceKey of change.dependencies) {
      context.copyObjectChangeKey(sourceKey, change.key);
    }
  }
}

class ImpactsBuilder {
  private readonly impacts = new Map<string, coreImportData.Impact>();

  constructor(private readonly change: coreImportData.ObjectChange) {
  }

  add(update: Update) {
    switch (update.type) {
      case 'plugin-set': {
        const { plugin } = update as PluginSetUpdate;
        this.ensureRootUpdate(update, ['add', 'update'], 'plugin', plugin.id);
        break;
      }

      case 'plugin-clear': {
        const { pluginId } = update as PluginClearUpdate;
        this.ensureRootUpdate(update, 'delete', 'plugin', pluginId);
        break;
      }
  
      case 'component-set': {
        const { component } = update as ComponentSetUpdate;
        this.ensureRootUpdate(update, ['add', 'update'], 'component', component.id);
        break;
      }

      case 'component-clear': {
        const { templateId, componentId } = update as ComponentClearUpdate;
        this.ensureRootUpdate(update, 'delete', 'component', componentId, !templateId);
        break;
      }

      case 'component-reset-config':
      case 'component-clear-config':
        this.addComponentConfig(update as ComponentConfigUpdate);
        break;

      case 'binding-clear':
        this.addBindingClear(update as BindingClearUpdate);
        break;

      case 'template-clear-export':
        this.addTemplateClearExport(update as TemplateClearExportsUpdate);
        break;

      default:
        throw new Error(`Unexpected update type: '${update.type}'`);
    }
  }

  private addComponentConfig({ type, templateId, componentId, configId }: ComponentConfigUpdate) {
    const id = `component-config::${templateId || ''}:${componentId}`;
    const impact = this.ensureImpact<coreImportData.ComponentConfigImpact>(id, () => ({
      type: 'component-config',
      templateId,
      componentId,
      config: {}
    }));

    switch (type) {
      case 'component-clear-config':
        impact.config[configId] = 'delete';
        break;

      case 'component-reset-config':
        impact.config[configId] = 'update';
        break;
    }
  }

  private addBindingClear({ templateId, bindingId }: BindingClearUpdate) {
    const id = `binding-delete:${templateId || ''}:${bindingId}`;
    this.ensureImpact<coreImportData.BindingDeleteImpact>(id, () => ({
      type: 'binding-delete',
      templateId,
      bindingId,
    }));
  }

  private addTemplateClearExport({ templateId, exportType, exportId }: TemplateClearExportsUpdate) {
    const id = `template-export:${templateId}`;

    const impact = this.ensureImpact<coreImportData.TemplateExportImpact>(id, () => ({
      type: 'template-export',
      templateId,
      configExportDeletes: [],
      memberExportDeletes: []
    }));

    let list: string[] = null;

    switch (exportType) {
      case 'config':
        list = impact.configExportDeletes;
        break;

      case 'member':
        list = impact.memberExportDeletes;
        break;
    }

    if (!list.includes(exportId)) {
      list.push(exportId);
    }
  }

  private ensureRootUpdate(update: Update, changeTypes: coreImportData.ChangeType | coreImportData.ChangeType[], objectType: coreImportData.ObjectType, changeId: string, additionalConditions = true) {
    if (!Array.isArray(changeTypes)) {
      changeTypes = [changeTypes];
    }

    // Check that this is the root update
    if (changeTypes.includes(this.change.changeType) && this.change.objectType === objectType && this.change.id === changeId && additionalConditions) {
      return;
    }

    // else this is unexpected
    throw new Error(`Unexpected update found on change computation: ${JSON.stringify(update)}`);
  }

  private ensureImpact<TImpact extends coreImportData.Impact>(id: string, creator: () => TImpact) {
    let impact = this.impacts.get(id) as TImpact;
    if (impact) {
      return impact;
    }

    impact = creator();
    this.impacts.set(id, impact);
    return impact;
  }

  build() {
    return Array.from(this.impacts.values());
  }
}

function computeObjectImpacts(context: ComputeContext, changes: coreImportData.ObjectChange[]) {
  for (const change of changes) {
    const builder = new ImpactsBuilder(change);

    for (const update of context.getAllObjectUpdates(change.key)) {
      builder.add(update);
    }

    change.impacts = builder.build();
  }
}
