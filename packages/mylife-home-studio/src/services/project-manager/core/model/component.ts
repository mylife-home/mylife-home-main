import { logger } from 'mylife-home-common';
import { MemberType } from '../../../../../shared/component-model';
import { CoreComponentData } from '../../../../../shared/project-manager';
import { BindingModel } from './binding';
import { InstanceModel } from './instance';
import { PluginModel } from './plugin';
import { TemplateModel } from './template';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:model');

export class ComponentModel {
  private bindingsFrom = new Set<BindingModel>();
  private bindingsTo = new Set<BindingModel>();
  private _plugin: PluginModel;
  private _template: TemplateModel; // null if on project directly

  constructor(public readonly instance: InstanceModel, plugin: PluginModel, template: TemplateModel, private _id: string, public readonly data: CoreComponentData) {
    this._plugin = plugin;
    this._template = template;
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

  get plugin() {
    return this._plugin;
  }

  get template() {
    return this._template;
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
    this.plugin.validateConfigValue(configId, configValue);
    this.data.config[configId] = configValue;
  }

  checkDelete() {
    if (this.template?.hasExportWithComponentId(this.id)) {
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
    const memberType = this.plugin.data.members[memberName].memberType;

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
