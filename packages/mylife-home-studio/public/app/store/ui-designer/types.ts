import { DesignerNewTabData, OpenedProjectBase, DesignerState } from '../common/designer-types';

export const enum ActionTypes {
  SET_NOTIFIER = 'ui-designer/set-notifier',
  CLEAR_ALL_NOTIFIERS = 'ui-designer/clear-all-notifiers',
  REMOVE_OPENED_PROJECT = 'ui-designer/remove-opened-project',
}

export { DesignerNewTabData };

export interface UiOpenedProject extends OpenedProjectBase {
  // TODO
}

export type UiDesignerState = DesignerState<UiOpenedProject>;
