import { logger } from 'mylife-home-common';
import { Member, MemberType } from '../../../../../shared/component-model';
import { CoreComponentConfiguration, CoreComponentData } from '../../../../../shared/project-manager';
import { BindingModel, PluginModel, TemplateModel } from '.';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:model');

export interface ComponentDefinitionModel {
  getMember(name: string): Member;
  ensureMember(memberName: string): void;
  getMemberType(memberName: string): MemberType;
  getMemberValueType(name: string, type: MemberType): string;
  
  ensureConfig(configName: string): void;
  validateConfigValue(configId: string, configValue: any): void;
  createConfigTemplateValue(configId: string): any;
  createConfigTemplate(): CoreComponentConfiguration;

  registerUsage(component: ComponentModel): void;
  unregisterUsage(id: string): void;
  getAllUsage(): Generator<ComponentModel>;
}

export class ComponentModel {
  private readonly bindingsFrom = new Set<BindingModel>();
  private readonly bindingsTo = new Set<BindingModel>();

  constructor(
    public readonly definition: ComponentDefinitionModel,
    public readonly ownerTemplate: TemplateModel, // null if on project directly
    private _id: string,
    public readonly data: CoreComponentData) {
  }

  executeImport(plugin: PluginModel, data: Omit<CoreComponentData, 'definition' | 'position'>) {
    // keep its position
    const { position } = this.data;

    for (const prop of Object.keys(this.data)) {
      delete (this.data as any)[prop];
    }

    Object.assign(this.data, data, { position, definition: { type: 'plugin', id: plugin.id } });
  }

  get id() {
    return this._id;
  }

  rename(newId: string) {
    this._id = newId;
  }

  move(delta: { x: number; y: number }) {
    this.data.position = {
      x: this.data.position.x + delta.x,
      y: this.data.position.y + delta.y,
    };
  }

  configure(configId: string, configValue: any) {
    if (this.data.config[configId] === undefined) {
      throw new Error(`Cannot configure exported item '${configId}'.`);
    }

    this.definition.validateConfigValue(configId, configValue);
    this.data.config[configId] = configValue;
  }

  exportConfig(configId: string) {
    delete this.data.config[configId];
  }

  unexportConfig(configId: string) {
    this.data.config[configId] = this.definition.createConfigTemplateValue(configId);
  }

  checkDelete() {
    if (this.ownerTemplate?.hasExportWithComponentId(this.id)) {
      throw new Error(`Cannot delete component '${this.id}' because it is used in template exports`);
    }
  }

  registerBinding(binding: BindingModel) {
    if (binding.sourceComponent === this) {
      this.bindingsFrom.add(binding);
    }
    if (binding.targetComponent === this) {
      this.bindingsTo.add(binding);
    }
  }

  unregisterBinding(binding: BindingModel) {
    if (binding.sourceComponent === this) {
      this.bindingsFrom.delete(binding);
    }
    if (binding.targetComponent === this) {
      this.bindingsTo.delete(binding);
    }
  }

  *getBindingsFrom() {
    for (const binding of this.bindingsFrom) {
      yield binding;
    }
  }

  *getBindingsTo() {
    for (const binding of this.bindingsTo) {
      yield binding;
    }
  }

  *getAllBindings() {
    for (const binding of this.bindingsFrom) {
      yield binding;
    }

    for (const binding of this.bindingsTo) {
      yield binding;
    }
  }

  *getAllBindingsIds() {
    for (const binding of this.getAllBindings()) {
      yield binding.id;
    }
  }

  *getAllBindingsWithMember(memberName: string) {
    const memberType = this.definition.getMemberType(memberName);

    switch (memberType) {
      case MemberType.STATE:
        for (const binding of this.bindingsFrom) {
          if (binding.sourceState === memberName) {
            yield binding;
          }
        }
        break;

      case MemberType.ACTION:
        for (const binding of this.bindingsTo) {
          if (binding.targetAction === memberName) {
            yield binding;
          }
        }
        break;

    }
  }
}
