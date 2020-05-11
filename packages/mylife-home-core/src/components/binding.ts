import { components } from 'mylife-home-common';

export interface BindingConfiguration {
  readonly sourceId: string;
  readonly sourceState: string;
  readonly targetId: string;
  readonly targetAction: string;
}

export class Binding {
  private source: components.Component;
  private target: components.Component;

  constructor(private readonly registry: components.Registry, private readonly config: BindingConfiguration) {
    this.registry.on('component.add', this.onComponentAdd);
    this.registry.on('component.remove', this.onComponentRemove);

    for (const component of this.registry.getComponents()) {
      this.onComponentAdd(null, component);
    }
  }

  close() {
    this.registry.off('component.add', this.onComponentAdd);
    this.registry.off('component.remove', this.onComponentRemove);

    if (this.source) {
      this.onComponentRemove(null, this.source);
    }
    if (this.target) {
      this.onComponentRemove(null, this.target);
    }
  }

  private readonly onComponentAdd = (instanceName: string, component: components.Component) => {
    switch (component.id) {
      case this.config.sourceId:
        this.source = component;
        this.source.on('state', this.onSourceStateChange);
        break;

      case this.config.targetId:
        this.target = component;
        break;
    }

    this.initBindingValue();
  };

  private readonly onComponentRemove = (instanceName: string, component: components.Component) => {
    switch (component.id) {
      case this.config.sourceId:
        this.source.off('state', this.onSourceStateChange);
        this.source = null;
        break;

      case this.config.targetId:
        this.target = null;
        break;
    }
  };

  private initBindingValue() {
    if (!this.source || !this.target) {
      return;
    }

    const { sourceState, targetAction } = this.config;
    const value = this.source.getState(sourceState);
    this.target.executeAction(targetAction, value);
  }

  private readonly onSourceStateChange = (name: string, value: any) => {
    const { sourceState, targetAction } = this.config;
    if (name !== sourceState) {
      return;
    }

    if (this.target) {
      this.target.executeAction(targetAction, value);
    }
  };
}
