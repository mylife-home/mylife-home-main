import { components, logger } from 'mylife-home-common';
import { BindingConfig } from '../store';

const log = logger.createLogger('mylife:home:core:components:binding');

export class Binding {
  private source: components.ComponentData;
  private target: components.ComponentData;
  private _errors: string[];

  public get error() {
    return !!this._errors.length;
  }

  public get errors(): readonly string[] {
    return this._errors;
  }

  public get active() {
    return this.source && this.target && !this.error;
  }

  constructor(private readonly registry: components.Registry, private readonly config: BindingConfig) {
    this.registry.on('component.add', this.onComponentAdd);
    this.registry.on('component.remove', this.onComponentRemove);

    for (const component of this.registry.getComponents()) {
      this.onComponentAdd(null, component);
    }

    log.info(`Binding '${JSON.stringify(this.config)}' created`);
  }

  close() {
    this.registry.off('component.add', this.onComponentAdd);
    this.registry.off('component.remove', this.onComponentRemove);

    if (this.source) {
      this.onComponentRemove(this.source.instanceName, this.source.component);
    }
    if (this.target) {
      this.onComponentRemove(this.target.instanceName, this.target.component);
    }

    log.info(`Binding '${JSON.stringify(this.config)}' closed`);
  }

  private readonly onComponentAdd = (instanceName: string, component: components.Component) => {
    switch (component.id) {
      case this.config.sourceId:
        this.source = { instanceName, component };
        this.initBinding();
        break;

      case this.config.targetId:
        this.target = { instanceName, component };
        this.initBinding();
        break;
    }
  };

  private readonly onComponentRemove = (instanceName: string, component: components.Component) => {
    switch (component) {
      case this.source?.component:
        this.terminateBinding();
        this.source = null;
        break;

      case this.target?.component:
        this.terminateBinding();
        this.target = null;
        break;
    }
  };

  private initBinding() {
    if (!this.source || !this.target) {
      return;
    }

    const { sourceState, targetAction } = this.config;

    // assert that props exists and type matches
    const sourcePlugin = this.source.component.plugin;
    const targetPlugin = this.target.component.plugin;
    const sourceMember = findMember(sourcePlugin, sourceState, components.metadata.MemberType.STATE);
    const targetMember = findMember(targetPlugin, targetAction, components.metadata.MemberType.ACTION);

    const errors = [];

    if (!sourceMember) {
      errors.push(`State '${sourceState}' does not exist on component ${buildComponentFullId(this.source)}`);
    }

    if (!targetMember) {
      errors.push(`Action '${targetAction}' does not exist on component ${buildComponentFullId(this.target)}`);
    }

    if (sourceMember && targetMember) {
      const sourceType = sourceMember.valueType.toString();
      const targetType = targetMember.valueType.toString();
      if (sourceType !== targetType) {
        const sourceDesc = `State '${sourceState}' on component ${buildComponentFullId(this.source)}`;
        const targetDesc = `action '${targetAction}' on component ${buildComponentFullId(this.target)}`;
        errors.push(`${sourceDesc} has type '${sourceType}', which is different from type '${targetType}' for ${targetDesc}`);
      }
    }

    this._errors = errors;
    if (errors.length) {
      // we have errors, do not activate binding
      log.error(`Binding '${JSON.stringify(this.config)}' errors: ${this.errors.join(', ')}`);
      return;
    }

    this.source.component.on('state', this.onSourceStateChange);

    const value = this.source.component.getState(sourceState);
    if (value !== null) {
      // not provided yet, don't bind null values
      this.target.component.executeAction(targetAction, value);
    }

    log.debug(`Binding '${JSON.stringify(this.config)}' activated`);
  }

  private terminateBinding() {
    if (this.active) {
      this.source.component.off('state', this.onSourceStateChange);
    }

    this._errors = [];

    log.debug(`Binding '${JSON.stringify(this.config)}' deactivated`);
  }

  private readonly onSourceStateChange = (name: string, value: any) => {
    const { sourceState, targetAction } = this.config;
    if (name !== sourceState) {
      return;
    }

    if (this.target) {
      this.target.component.executeAction(targetAction, value);
    }
  };
}

function findMember(plugin: components.metadata.Plugin, name: string, type: components.metadata.MemberType): components.metadata.Member {
  const member = plugin.members[name];
  if (!member || member.memberType !== type) {
    return;
  }

  return member;
}

function buildComponentFullId(componentData: components.ComponentData) {
  return `'${componentData.component.id}' (plugin='${componentData.instanceName || 'local'}:${componentData.component.plugin.id}')`;
}