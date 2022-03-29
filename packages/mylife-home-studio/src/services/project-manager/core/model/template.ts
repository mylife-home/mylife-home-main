import { logger } from 'mylife-home-common';
import { CoreComponentConfiguration, CoreTemplate } from '../../../../../shared/project-manager';
import { ComponentDefinitionModel, ComponentModel } from './component';
import { ViewModel } from './view';
import { ProjectModel } from './project';
import { MemberType } from 'mylife-home-common/dist/components/metadata';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:model');

export class TemplateModel extends ViewModel implements ComponentDefinitionModel {
  private readonly usage = new Map<string, ComponentModel>();

  constructor(protected readonly project: ProjectModel, private _id: string, public readonly data: CoreTemplate) {
    super();
    this.init();
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

  setExport(exportType: 'config' | 'member', exportId: string, componentId: string, propertyName: string) {
    switch (exportType) {

    case 'config': 
      this.setConfigExport(exportId, componentId, propertyName);
      break;

    case 'member':
      this.setMemberExport(exportId, componentId, propertyName);
      break;

    default:
      throw new Error(`Invalid export type: '${exportType}'`);
    }
  }

  private setConfigExport(exportId: string, componentId: string, configName: string) {
    const component = this.getComponent(componentId);
    component.definition.ensureConfig(configName);

    const exports = this.data.exports.config;
    exports[exportId] = { component: component.id, configName };
  }

  private setMemberExport(exportId: string, componentId: string, memberName: string) {
    const component = this.getComponent(componentId);
    component.definition.ensureMember(memberName);

    const exports = this.data.exports.members;
    exports[exportId] = { component: component.id, member: memberName };
  }

  clearExport(exportType: 'config' | 'member', exportId: string) {
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
