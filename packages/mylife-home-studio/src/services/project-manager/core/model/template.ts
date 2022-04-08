import { logger } from 'mylife-home-common';
import { MemberType } from '../../../../../shared/component-model';
import { CoreComponentConfiguration, CoreComponentDefinition, CoreTemplate } from '../../../../../shared/project-manager';
import { ComponentDefinitionModel, ComponentModel, ViewModel, ProjectModel } from '.';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:model');

export class TemplateModel extends ViewModel implements ComponentDefinitionModel {
  private readonly usage = new Map<string, ComponentModel>();

  constructor(protected readonly project: ProjectModel, private _id: string, public readonly data: CoreTemplate) {
    super();
  }

  init() {
    super.init();
  }

  get id() {
    return this._id;
  }

  rename(newId: string) {
    this._id = newId;
  }

  registerUsage(component: ComponentModel) {
    this.usage.set(component.id, component);
  }

  unregisterUsage(id: string) {
    this.usage.delete(id);
  }

  get used() {
    return this.usage.size > 0;
  }

  *getAllUsage() {
    for (const component of this.usage.values()) {
      yield component;
    }
  }

  *getRecursiveTemplateUsage(): Generator<TemplateModel> {
    for (const component of this.getAllUsage()) {
      if (component.ownerTemplate) {
        yield component.ownerTemplate;

        for (const child of component.ownerTemplate.getRecursiveTemplateUsage()) {
          yield child;
        }
      }
    }
  }

  setComponent(componentId: string, definition: CoreComponentDefinition, x: number, y: number) {
    // check for circular dependency
    const usageTemplates = new Set(Array.from(this.getRecursiveTemplateUsage()).map(template => template.id));
    if (definition.type === 'template' && usageTemplates.has(definition.id)) {
      throw new Error(`Cannot create component using template '${definition.id}' because it could create a circular dependency.`);
    }

    return super.setComponent(componentId, definition, x, y);
  }

  clearComponent(id: string) {
    // first check that it is not used in export
    for (const [exportId, configExport] of Object.entries(this.data.exports.config)) {
      if (configExport.component === id) {
        throw new Error(`Cannot delete component '${id}' because it is used in template config export '${exportId}'.`);
      }
    }

    for (const [exportId, memberExport] of Object.entries(this.data.exports.members)) {
      if (memberExport.component === id) {
        throw new Error(`Cannot delete component '${id}' because it is used in template member export '${exportId}'.`);
      }
    }

    return super.clearComponent(id);
  }
  
  setExport(exportType: 'config' | 'member', exportId: string, componentId: string, propertyName: string) {
    switch (exportType) {

    case 'config': 
      return this.setConfigExport(exportId, componentId, propertyName);

    case 'member':
      return this.setMemberExport(exportId, componentId, propertyName);

    default:
      throw new Error(`Invalid export type: '${exportType}'`);
    }
  }

  private setConfigExport(exportId: string, componentId: string, configName: string) {
    const updatedComponents = new Set<ComponentModel>();
    
    const component = this.getComponent(componentId);
    component.definition.ensureConfig(configName);

    const exports = this.data.exports.config;

    // check that the config item is not exported twice
    for (const [id, item] of Object.entries(exports)) {
      if (id === exportId) {
        continue;
      }

      if (item.component === componentId && item.configName === configName) {
        throw new Error(`Config item '${configName}' of component '${componentId}' is already exported as '${id}'.`);
      }
    }

    const existing = exports[exportId];
    if (existing) {
      const oldComponent = this.getComponent(existing.component);
      oldComponent.unexportConfig(existing.configName);
      updatedComponents.add(oldComponent);
    }

    exports[exportId] = { component: component.id, configName };
    component.exportConfig(configName);
    updatedComponents.add(component);

    // add config on each usage
    for (const component of this.getAllUsage()) {
      component.addConfig(exportId);
      updatedComponents.add(component);
    }

    return { updatedComponents: Array.from(updatedComponents) };
  }

  private setMemberExport(exportId: string, componentId: string, memberName: string) {
    const component = this.getComponent(componentId);
    component.definition.ensureMember(memberName);

    const exports = this.data.exports.members;
    exports[exportId] = { component: component.id, member: memberName };

    const updatedComponents: ComponentModel[] = [];
    return { updatedComponents };
  }

  importClearExport(exportType: 'config' | 'member', exportId: string) {
    // Note: checks done already

    switch (exportType) {
      case 'config': {
        const exports = this.data.exports.config;
        delete exports[exportId];
        break;
      }
  
      case 'member': {
        const exports = this.data.exports.members;
        delete exports[exportId];
        break;
      }
  
      default:
        throw new Error(`Invalid export type: '${exportType}'`);
    }
  }

  renameComponent(id: string, newId: string) {
    super.renameComponent(id, newId);

    for (const configExport of Object.values(this.data.exports.config)) {
      if (configExport.component === id) {
        configExport.component = newId;
      }
    }

    for (const memberExport of Object.values(this.data.exports.members)) {
      if (memberExport.component === id) {
        memberExport.component = newId;
      }
    }
  }

  hasExportWithComponentId(id: string) {
    for (const configExport of Object.values(this.data.exports.config)) {
      if (configExport.component === id) {
        return true;
      }
    }

    for (const memberExport of Object.values(this.data.exports.members)) {
      if (memberExport.component === id) {
        return true;
      }
    }

    return false;
  }

  private getDefinitionConfig(configId: string) {
    const configItem = this.data.exports.config[configId];
    if (!configItem) {
      throw new Error(`Config '${name}' does not exist on template '${this.id}'`);
    }

    const { definition } = this.getComponent(configItem.component);
    return { definition, definitionConfigId: configItem.configName };
  }

  ensureConfig(configId: string) {
    this.getDefinitionConfig(configId);
  }

  validateConfigValue(configId: string, configValue: any) {
    const { definition, definitionConfigId } = this.getDefinitionConfig(configId)
    definition.validateConfigValue(definitionConfigId, configValue);
  }

  createConfigTemplateValue(configId: string): any {
    const { definition, definitionConfigId } = this.getDefinitionConfig(configId)
    return definition.createConfigTemplateValue(definitionConfigId);
  }

  createConfigTemplate(): CoreComponentConfiguration {
    const template: CoreComponentConfiguration = {};

    for (const configId of Object.keys(this.data.exports.config)) {
      template[configId] = this.createConfigTemplateValue(configId);
    }

    return template;
  }

  getMember(name: string) {
    const memberItem = this.data.exports.members[name];
    if (!memberItem) {
      throw new Error(`Member '${name}' does not exist on template '${this.id}'`);
    }

    const component = this.getComponent(memberItem.component);
    return component.definition.getMember(memberItem.member);
  }

  getMemberValueType(name: string, type: MemberType) {
    const member = this.getMember(name);

    if (member.memberType !== type) {
      throw new Error(`Member '${name}' of type '${type}' does not exist on template '${this.id}'`);
    }

    return member.valueType;
  }

  getMemberType(memberName: string) {
    const member = this.getMember(memberName);
    return member.memberType;
  }

  ensureMember(name: string) {
    this.getMember(name);
  }
}
