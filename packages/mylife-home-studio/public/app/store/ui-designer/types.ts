import { Component } from '../../../../shared/component-model';
import { ComponentData, PluginData } from '../../../../shared/project-manager';
import { Control, DefaultWindow, Definition, DefinitionResource } from '../../../../shared/ui-model';
import { DesignerTabActionData, OpenedProjectBase, DesignerState } from '../common/designer-types';
import { Table } from '../common/types';

export {
  UpdateProjectNotification,
  SetNameProjectNotification,
  SetUiDefaultWindowNotification,
  SetUiComponentDataNotification,
  SetUiResourceNotification,
  ClearUiResourceNotification,
  SetUiWindowNotification,
  ClearUiWindowNotification,
} from '../../../../shared/project-manager';
export { Definition, DefaultWindow, DefinitionResource, Window, Control } from '../../../../shared/ui-model';

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

export interface PluginModel extends PluginData {
  id: string; // id: instanceName:module.name
}

export interface WindowModel extends Omit<Window, 'controls'> {
  controls: string[];
}

// TODO
export interface UiOpenedProject2 extends OpenedProjectBase {
  components: Table<Component>; // plugin points to plugin instanceName:module.name
  plugins: Table<PluginModel>;

  resources: Table<DefinitionResource>;

  windows: Table<WindowModel>;
  controls: Table<Control>; // id = window:control

  defaultWindow: DefaultWindow;
}

export type UiDesignerState = DesignerState<UiOpenedProject>;
