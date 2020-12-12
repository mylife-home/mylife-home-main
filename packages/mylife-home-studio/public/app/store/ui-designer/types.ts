import { ComponentData } from '../../../../shared/project-manager';
import { Definition } from '../../../../shared/ui-model';
import { DesignerTabActionData, OpenedProjectBase, DesignerState } from '../common/designer-types';

export const enum ActionTypes {
  SET_NOTIFIER = 'ui-designer/set-notifier',
  CLEAR_ALL_NOTIFIERS = 'ui-designer/clear-all-notifiers',
  REMOVE_OPENED_PROJECT = 'ui-designer/remove-opened-project',
}

export { DesignerTabActionData };

export interface UiOpenedProject extends OpenedProjectBase {
  definition: Definition;
  componentData: ComponentData;
}

export type UiDesignerState = DesignerState<UiOpenedProject>;
