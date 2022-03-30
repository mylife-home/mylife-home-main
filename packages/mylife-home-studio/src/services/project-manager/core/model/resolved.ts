import { CoreComponentConfiguration, CorePluginData } from '../../../../../shared/project-manager';

export interface ResolvedProjectView {
  getComponentsIds(): string[];
  getComponent(id: string): ComponentView;
  getPluginsIds(): string[];
  getPlugin(id: string): PluginView;
}

export interface PluginView {
  readonly instance: InstanceView;
  readonly id: string;
  readonly data: CorePluginData;
}

export interface InstanceView {
  readonly instanceName: string;
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

