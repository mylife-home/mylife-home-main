import { CoreComponentConfiguration, CorePluginData } from '../../../../../shared/project-manager';

export interface ResolvedProjectView {
  getInstancesNames(): string[];
  getInstance(instanceName: string): InstanceView;
  getPluginsIds(): string[];
  getPlugin(id: string): PluginView;
  getComponentsIds(): string[];
  getComponent(id: string): ComponentView;
  getBindingsIds(): string[];
  getBinding(id: string): BindingView;
  hasBindings(): boolean;
  hasBinding(id: string): boolean;
}

export interface PluginView {
  readonly instance: InstanceView;
  readonly id: string;
  readonly data: CorePluginData;
  validateConfigValue(configId: string, configValue: any): void;
}

export interface InstanceView {
  readonly instanceName: string;

  hasNonExternalComponents(): boolean;
  hasNonExternalComponent(componentId: string): boolean;
  getAllNonExternalComponents(): Generator<ComponentView>;
}

export interface ComponentView {
  readonly id: string;
  readonly plugin: PluginView;
  readonly config: CoreComponentConfiguration;
  readonly external: boolean;
}

export interface BindingView {
  readonly id: string;
  readonly sourceComponent: ComponentView;
  readonly sourceState: string;
  readonly targetComponent: ComponentView;
  readonly targetAction: string;
}

