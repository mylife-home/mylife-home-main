import { Map, List } from 'immutable';

export const WINDOW_NEW = 'window/new';
export const WINDOW_CLEAR = 'window/clear';

export interface ControlDisplayMapItem {
  readonly min: number;
  readonly max: number;
  readonly value: string;
  readonly resource: string;
}

export interface ControlDisplay {
  readonly component: string;
  readonly attribute: string;
  readonly resource: string;
  readonly map: List<ControlDisplayMapItem>;
}

export interface ControlTextContextItem {
  readonly id: string;
  readonly component: string;
  readonly attribute: string;
}

export interface ControlText {
  readonly context: List<ControlTextContextItem>;
  readonly format: string;
  readonly func: (args: string[]) => string;
}

export interface Action {
  readonly component: string;
  readonly action: string;
  readonly window: string;
  readonly popup: boolean;
}

export interface Control {
  readonly id: string;
  readonly style: string;
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
  readonly display: ControlDisplay;
  readonly text: ControlText;
  readonly primaryAction: Action;
  readonly secondaryAction: Action;
}

export interface Window {
  readonly id: string;
  readonly style: string;
  readonly height: number;
  readonly width: number;
  readonly resource: string;
  readonly controls: Map<string, Control>;
}

export type WindowsState = Map<string, Window>;

export interface ControlDisplayMapItemRaw {
  readonly min: number;
  readonly max: number;
  readonly value: string;
  readonly resource_id: string;
}

export interface ControlDisplayRaw {
  readonly component_id: string;
  readonly component_attribute: string;
  readonly default_resource_id: string;
  readonly map: ControlDisplayMapItemRaw[];
}

export interface ControlTextContextItemRaw {
  readonly id: string;
  readonly component_id: string;
  readonly component_attribute: string;
}

export interface ControlTextRaw {
  readonly context: ControlTextContextItemRaw[];
  readonly format: string;
}

export interface ActionComponentRaw {
  readonly component_id: string;
  readonly component_action: string;
}

export interface ActionWindowRaw {
  readonly id: string;
  readonly popup: boolean;
}

export interface ActionRaw {
  readonly component: ActionComponentRaw;
  readonly window: ActionWindowRaw;
}

export interface ControlRaw {
  readonly id: string;
  readonly style: string;
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
  readonly display: ControlDisplayRaw;
  readonly text: ControlTextRaw;
  readonly primary_action: ActionRaw;
  readonly secondary_action: ActionRaw;
}

export interface WindowRaw {
  readonly id: string;
  readonly style: string;
  readonly height: number;
  readonly width: number;
  readonly background_resource_id: string;
  readonly controls: ControlRaw[];
}

export interface VControl {
  readonly id: string;
  readonly height: number;
  readonly width: number;
  readonly left: number;
  readonly top: number;
  readonly display: any;
  readonly text: string;
  readonly active: boolean;
}

export interface VWindow {
  readonly id: string;
  readonly style: string;
  readonly height: number;
  readonly width: number;
  readonly resource: any;
  readonly controls: VControl[];
}
