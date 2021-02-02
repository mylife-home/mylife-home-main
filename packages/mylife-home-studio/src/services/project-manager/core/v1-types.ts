export interface Project {
  Name: string;
  CreateDate: string; // "/Date(1451942270573)/"
  LastUpdate: string;
  Components: ComponentContainer[];
  Toolbox: ToolboxItem[];
}

export interface ComponentContainer {
  readonly EntityName: string;
  readonly Component: Component;
}

export interface Component {
  readonly id: string;
  readonly library: string;
  readonly type: string;
  readonly bindings: ComponentBinding[];
  readonly config: ComponentConfig[];
  readonly designer: ComponentDesigner[];
}

export interface ComponentBinding {
  readonly local_action: string;
  readonly remote_attribute: string;
  readonly remote_id: string;
}

export interface ComponentConfig {
  readonly Key: string;
  readonly Value: string;
}

export interface ComponentDesigner {
  readonly Key: string;
  readonly Value: string;
}

export interface ToolboxItem {
  readonly EntityName: string;
  readonly Plugins: Plugin[];
}

export interface Plugin {
  readonly clazz: string;
  readonly config: string;
  readonly library: string;
  readonly type: string;
  readonly usage: number;
  readonly version: string;
}
