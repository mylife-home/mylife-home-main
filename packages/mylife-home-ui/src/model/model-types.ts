export type Style = string;
export type Resource = string;

export interface Model {
  windows: Window[];
  defaultWindow: { [type: string]: string; };
}

export interface Window {
  readonly id: string;
  readonly height: number;
  readonly width: number;
  readonly style: Style;
  readonly background_resource_id: Resource;
  readonly controls: Control[];
}

export interface Control {
  readonly id: string;
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
  readonly style: Style;
  readonly display: ControlDisplay;
  readonly text: ControlText;
  readonly primary_action: ControlAction;
  readonly secondary_action: ControlAction;
}

export interface ControlDisplay {
  readonly component_id: string;
  readonly component_attribute: string;
  readonly default_resource_id: Resource;
  readonly map: any;
}

export interface ControlDisplayMapItem {
  max: number,
  min: number,
  resource_id: Resource,
  value: any;
}

export interface ControlText {
  readonly format: string;
  readonly context: ControlTextContextItem[];
}

export interface ControlTextContextItem {
  readonly component_id: string;
  readonly component_attribute: string;
  readonly id: string;
}

export interface ControlAction {
  readonly component: ControlActionComponent;
  readonly window: ControlActionWindow;
}

export interface ControlActionComponent {
  readonly component_id: string;
  readonly component_action: string;
}

export interface ControlActionWindow {
  readonly id: string;
  readonly popup: boolean;
}
