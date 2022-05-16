export type Style = string[]; // static for now
export type Resource = string;

export interface Model {
  windows: Window[];
  defaultWindow: DefaultWindow;
  styleHash: string; // css file to fetch
}

export type DefaultWindow = { [type: string]: string; };

export interface Window {
  readonly id: string;
  readonly style: Style;
  readonly height: number;
  readonly width: number;
  readonly backgroundResource: Resource;
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
  readonly primaryAction: Action;
  readonly secondaryAction: Action;
}

export interface ControlDisplay {
  readonly componentId: string;
  readonly componentState: string;
  readonly defaultResource: Resource;
  readonly map: ControlDisplayMapItem[];
}

export interface ControlDisplayMapItem {
  readonly min: number;
  readonly max: number;
  readonly value: string | boolean; // or others ?
  readonly resource: Resource;
}

export interface ControlText {
  readonly context: ControlTextContextItem[];
  readonly format: string;
}

export interface ControlTextContextItem {
  readonly id: string;
  readonly componentId: string;
  readonly componentState: string;
}

export interface Action {
  readonly component: ActionComponent;
  readonly window: ActionWindow;
}

export interface ActionComponent {
  readonly id: string;
  readonly action: string;
}

export interface ActionWindow {
  readonly id: string;
  readonly popup: boolean;
}
