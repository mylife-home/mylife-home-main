import { components } from 'mylife-home-common';

export interface BindingConfiguration {
  readonly sourceId: string;
  readonly sourceState: string;
  readonly targetId: string;
  readonly targetAction: string;
}

export class Binding {
  constructor(registry: components.Registry, config: BindingConfiguration) {}
}
