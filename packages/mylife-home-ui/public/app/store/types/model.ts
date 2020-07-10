import { Map, List } from 'immutable';
import { Action, ControlDisplayMapItem, ControlTextContextItem } from '../../../../shared/model';

export const MODEL_SET = 'model/set';

export type WindowsState = Map<string, Window>;

export interface Window {
  readonly id: string;
  readonly style: string;
  readonly height: number;
  readonly width: number;
  readonly backgroundResource: string;
  readonly controls: Map<string, Control>;
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

export interface ControlDisplay {
  readonly componentId: string;
  readonly componentState: string;
  readonly defaultResource: string;
  readonly map: List<ControlDisplayMapItem>;
}

export interface ControlText {
  readonly context: List<ControlTextContextItem>;
  readonly format: string;
  readonly func: (args: string[]) => string;
}

export interface VControl {
  readonly id: string;
  readonly height: number;
  readonly width: number;
  readonly left: number;
  readonly top: number;
  readonly display: string;
  readonly text: string;
  readonly active: boolean;
}

export interface VWindow {
  readonly id: string;
  readonly style: string;
  readonly height: number;
  readonly width: number;
  readonly backgroundResource: string;
  readonly controls: VControl[];
}
