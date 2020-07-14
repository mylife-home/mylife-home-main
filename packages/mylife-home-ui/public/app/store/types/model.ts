export * from '../../../../shared/model';
import { Window } from '../../../../shared/model';

export const MODEL_SET = 'model/set';

export type WindowsState = Window[];

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
