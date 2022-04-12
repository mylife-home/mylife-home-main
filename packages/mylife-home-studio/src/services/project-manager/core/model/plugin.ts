import { logger } from 'mylife-home-common';
import { ConfigType, MemberType } from '../../../../../shared/component-model';
import { CoreComponentConfiguration, CorePluginData, CoreToolboxDisplay } from '../../../../../shared/project-manager';
import { ComponentDefinitionModel, ComponentModel, InstanceModel } from '.';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:model');

export class PluginModel implements ComponentDefinitionModel {
  private readonly usage = new Map<string, ComponentModel>();

  constructor(public readonly instance: InstanceModel, private _id: string, public readonly data: CorePluginData) { }

  executeImport(data: CorePluginData) {
    for (const prop of Object.keys(this.data)) {
      delete (this.data as any)[prop];
    }

    Object.assign(this.data, data);
  }

  get id() {
    return this._id;
  }

  registerUsage(component: ComponentModel) {
    this.usage.set(component.id, component);
    this.instance.registerUsage(component);
  }

  unregisterUsage(id: string) {
    this.usage.delete(id);
    this.instance.unregisterUsage(id);
  }

  get used() {
    return this.usage.size > 0;
  }

  *getAllUsage() {
    for (const component of this.usage.values()) {
      yield component;
    }
  }

  getMember(name: string) {
    const member = this.data.members[name];
    if (!member) {
      throw new Error(`Member '${name}' does not exist on plugin '${this.id}'`);
    }

    return member;
  }

  getMemberValueType(name: string, type: MemberType) {
    const member = this.getMember(name);

    if (member.memberType !== type) {
      throw new Error(`Member '${name}' of type '${type}' does not exist on plugin '${this.id}'`);
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

  createConfigTemplateValue(configId: string) {
    const { valueType } = this.data.config[configId];
    switch (valueType) {
      case ConfigType.STRING:
        return '';

      case ConfigType.BOOL:
        return false;

      case ConfigType.INTEGER:
      case ConfigType.FLOAT:
        return 0;

      default:
        throw new Error(`Unsupported config type: '${valueType}'`);
    }
}

  createConfigTemplate() {
    const template: CoreComponentConfiguration = {};

    for (const configId of Object.keys(this.data.config)) {
      template[configId] = this.createConfigTemplateValue(configId);
    }

    return template;
  }

  private getConfigType(configId: string) {
    const item = this.data.config[configId];
    if (!item) {
      throw new Error(`Config '${configId}' does not exist on plugin '${this.id}'`);
    }

    return item.valueType;
  }

  ensureConfig(configId: string) {
    this.getConfigType(configId);
  }

  validateConfigValue(configId: string, configValue: any) {
    const valueType = this.getConfigType(configId);
    PluginModel.validateConfigValueByType(this.id, configId, valueType, configValue);
  }

  updateDisplay(wantedDisplay: CoreToolboxDisplay) {
    if (this.data.toolboxDisplay === wantedDisplay) {
      return false;
    }

    this.data.toolboxDisplay = wantedDisplay;
    return true;
  }

  // used by PluginView also
  static validateConfigValueByType(pluginId: string, configId: string, valueType: string, configValue: any) {
    switch (valueType) {
      case ConfigType.STRING:
        if (typeof configValue !== 'string') {
          throw new Error(`Expected config ${configId}' on plugin '${pluginId}' to be a string but got '${JSON.stringify(configValue)}'.`);
        }
        break;

      case ConfigType.BOOL:
        if (typeof configValue !== 'boolean') {
          throw new Error(`Expected config ${configId}' on plugin '${pluginId}' to be a bool but got '${JSON.stringify(configValue)}'.`);
        }
        break;

      case ConfigType.INTEGER:
        if (!Number.isInteger(configValue)) {
          throw new Error(`Expected config ${configId}' on plugin '${pluginId}' to be an integer but got '${JSON.stringify(configValue)}'.`);
        }
        break;

      case ConfigType.FLOAT:
        if (typeof configValue !== 'number') {
          throw new Error(`Expected config ${configId}' on plugin '${pluginId}' to be a float but got '${JSON.stringify(configValue)}'.`);
        }
        break;
    }
  }
}
