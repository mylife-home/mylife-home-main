import { Map, List } from 'immutable';

export const WINDOW_NEW = 'window/new';

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
  readonly primaryAction: Action;
  readonly secondaryAction: Action;
  readonly text: ControlText;
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