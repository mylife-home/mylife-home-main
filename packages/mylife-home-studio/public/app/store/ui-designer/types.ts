import { Component } from '../../../../shared/component-model';
import { PluginData } from '../../../../shared/project-manager';
import { Window, Control, DefaultWindow, DefinitionResource } from '../../../../shared/ui-model';
import { DesignerTabActionData, OpenedProjectBase, DesignerState } from '../common/designer-types';
import { Table } from '../common/types';

export const enum ActionTypes {
  SET_NOTIFIER = 'ui-designer/set-notifier',
  CLEAR_ALL_NOTIFIERS = 'ui-designer/clear-all-notifiers',
  REMOVE_OPENED_PROJECT = 'ui-designer/remove-opened-project',
  UPDATE_PROJECT = 'ui-designer/update-project',

  SET_DEFAULT_WINDOW = 'ui-designer/set-default-window',
  // TODO: refresh components
  SET_RESOURCE = 'ui-designer/set-resource',
  CLEAR_RESOURCE = 'ui-designer/clear-resource',
  RENAME_RESOURCE = 'ui-designer/rename-resource',
  SET_WINDOW = 'ui-designer/set-window',
  CLEAR_WINDOW = 'ui-designer/clear-window',
  RENAME_WINDOW = 'ui-designer/rename-window',
  SET_CONTROL = 'ui-designer/set-control',
  CLEAR_CONTROL = 'ui-designer/clear-control',
  RENAME_CONTROL = 'ui-designer/rename-control',
}

export { DesignerTabActionData, DefaultWindow };

export type UiComponent = Component;
export type UiResource = DefinitionResource;
export type UiControl = Control; // with id = windowId:controlId

export interface UiPlugin extends PluginData {
  id: string; // id: instanceName:module.name
}

export interface UiWindow extends Omit<Window, 'controls'> {
  controls: string[];
}

export interface UiOpenedProject extends OpenedProjectBase {
  components: Table<UiComponent>; // plugin points to plugin instanceName:module.name
  plugins: Table<UiPlugin>;

  resources: Table<DefinitionResource>;

  windows: Table<UiWindow>;
  controls: Table<UiControl>; // id = window:control

  defaultWindow: DefaultWindow;
}

export type UiDesignerState = DesignerState<UiOpenedProject>;
