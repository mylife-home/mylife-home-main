import { ComponentData } from '../../../../shared/project-manager';
import { Definition } from '../../../../shared/ui-model';
import { DesignerTabActionData, OpenedProjectBase, DesignerState } from '../common/designer-types';

export { UpdateProjectNotification } from '../../../../shared/project-manager';
export { DefaultWindow, DefinitionResource, Window } from '../../../../shared/ui-model';

export const enum ActionTypes {
  SET_NOTIFIER = 'ui-designer/set-notifier',
  CLEAR_ALL_NOTIFIERS = 'ui-designer/clear-all-notifiers',
  REMOVE_OPENED_PROJECT = 'ui-designer/remove-opened-project',
  UPDATE_PROJECT = 'ui-designer/update-project',

  SET_DEFAULT_WINDOW = 'ui-designer/set-default-window',
  // TODO: refresh components
  SET_RESOURCE = 'ui-designer/set-resource',
  CLEAR_RESOURCE = 'ui-designer/clear-resource',
  SET_WINDOW = 'ui-designer/set-window',
  CLEAR_WINDOW = 'ui-designer/clear-window',
}

export { DesignerTabActionData };

export interface UiOpenedProject extends OpenedProjectBase {
  definition: Definition;
  componentData: ComponentData;
}

export type UiDesignerState = DesignerState<UiOpenedProject>;
