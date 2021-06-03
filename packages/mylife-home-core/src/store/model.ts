export const enum StoreItemType {
  COMPONENT = 'component',
  BINDING = 'binding'
}

export interface StoreItem {
  readonly type: StoreItemType;
  readonly config: ComponentConfig | BindingConfig;
}

export interface ComponentConfig {
  readonly id: string;
  readonly plugin: string;
  readonly config: { [name: string]: any };
}

export interface BindingConfig {
  readonly sourceComponent: string;
  readonly sourceState: string;
  readonly targetComponent: string;
  readonly targetAction: string;
}
