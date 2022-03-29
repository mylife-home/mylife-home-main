import { logger } from 'mylife-home-common';
import { ConfigType, MemberType } from '../../../../../shared/component-model';
import { CorePluginData, CoreToolboxDisplay } from '../../../../../shared/project-manager';
import { ComponentModel } from './component';
import { InstanceModel } from './instance';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:model');

export class PluginModel {
  public readonly usage = new Map<string, ComponentModel>();

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

  registerComponent(component: ComponentModel) {
    this.usage.set(component.id, component);
  }

  unregisterComponent(id: string) {
    this.usage.delete(id);
  }

  get used() {
    return this.usage.size > 0;
  }

  getMemberType(name: string, type: MemberType) {
    const member = this.data.members[name];
    if (!member || member.memberType !== type) {
      throw new Error(`Member '${name}' of type '${type}' does not exist on plugin '${this.id}'`);
    }

    return member.valueType;
  }

  ensureMember(name: string) {
    const member = this.data.members[name];
    if (!member) {
      throw new Error(`Member '${name}' does not exist on plugin '${this.id}'`);
    }
  }

  updateDisplay(wantedDisplay: CoreToolboxDisplay) {
    if (this.data.toolboxDisplay === wantedDisplay) {
      return false;
    }

    this.data.toolboxDisplay = wantedDisplay;
    return true;
  }

  createConfigTemplate() {
    const template: { [name: string]: any; } = {};

    for (const [name, { valueType }] of Object.entries(this.data.config)) {
      switch (valueType) {
        case ConfigType.STRING:
          template[name] = '';
          break;

        case ConfigType.BOOL:
          template[name] = false;
          break;

        case ConfigType.INTEGER:
        case ConfigType.FLOAT:
          template[name] = 0;
          break;

        default:
          throw new Error(`Unsupported config type: '${valueType}'`);
      }
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

    switch (valueType) {
      case ConfigType.STRING:
        if (typeof configValue !== 'string') {
          throw new Error(`Expected config ${configId}' on plugin '${this.id}' to be a string but got '${JSON.stringify(configValue)}'.`);
        }
        break;

      case ConfigType.BOOL:
        if (typeof configValue !== 'boolean') {
          throw new Error(`Expected config ${configId}' on plugin '${this.id}' to be a bool but got '${JSON.stringify(configValue)}'.`);
        }
        break;

      case ConfigType.INTEGER:
        if (!Number.isInteger(configValue)) {
          throw new Error(`Expected config ${configId}' on plugin '${this.id}' to be an integer but got '${JSON.stringify(configValue)}'.`);
        }
        break;

      case ConfigType.FLOAT:
        if (typeof configValue !== 'number') {
          throw new Error(`Expected config ${configId}' on plugin '${this.id}' to be a float but got '${JSON.stringify(configValue)}'.`);
        }
        break;
    }
  }
}
