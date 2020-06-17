import { VWindow } from './windows';

export const VIEW_POPUP = 'view/popup';
export const VIEW_CLOSE = 'view/close';
export const VIEW_CHANGE = 'view/change';

export interface VView {
  readonly main: VWindow,
  readonly popups: VWindow[];
}