export type Style = string;
export type Resource = string;

export interface Model {
  windows: Window[];
  defaultWindow: { [type: string]: string; };
}

export interface Window {
  readonly id: string;
  readonly style: Style;
  readonly height: number;
  readonly width: number;
  readonly background_resource_id: Resource;
  readonly controls: Control[];
}

export interface Control {
  readonly id: string;
  readonly style: Style;
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
  readonly display: ControlDisplay;
  readonly text: ControlText;
  readonly primary_action: Action;
  readonly secondary_action: Action;
}

export interface ControlDisplay {
  readonly component_id: string;
  readonly component_attribute: string;
  readonly default_resource_id: Resource;
  readonly map: ControlDisplayMapItem[];
}

export interface ControlDisplayMapItem {
  readonly min: number;
  readonly max: number;
  readonly value: string;
  readonly resource_id: Resource;
}

export interface ControlText {
  readonly context: ControlTextContextItem[];
  readonly format: string;
}

export interface ControlTextContextItem {
  readonly id: string;
  readonly component_id: string;
  readonly component_attribute: string;
}

export interface Action {
  readonly component: ActionComponent;
  readonly window: ActionWindow;
}

export interface ActionComponent {
  readonly component_id: string;
  readonly component_action: string;
}

export interface ActionWindow {
  readonly id: string;
  readonly popup: boolean;
}
