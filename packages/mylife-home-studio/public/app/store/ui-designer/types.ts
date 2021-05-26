import { Component } from '../../../../shared/component-model';
import { UiBreakingOperation, UiPluginData, UiElementPath, UiElementPathNode } from '../../../../shared/project-manager';
import { Window, Control, DefaultWindow, DefinitionResource } from '../../../../shared/ui-model';
import { DesignerTabActionData, OpenedProjectBase, DesignerState } from '../common/designer-types';
import { Table } from '../common/types';

export const enum ActionTypes {
  SET_NOTIFIER = 'ui-designer/set-notifier',
  CLEAR_ALL_NOTIFIERS = 'ui-designer/clear-all-notifiers',
  REMOVE_OPENED_PROJECT = 'ui-designer/remove-opened-project',
  UPDATE_PROJECT = 'ui-designer/update-project',

  VALIDATE_PROJECT = 'ui-designer/validate-project',
  REFRESH_COMPONENTS_FROM_ONLINE = 'ui-designer/refresh-components-from-online',
  REFRESH_COMPONENTS_FROM_PROJECT = 'ui-designer/refresh-components-from-project',
  APPLY_REFRESH_COMPONENTS = 'ui-designer/apply-refresh-components',
  DEPLOY_PROJECT = 'ui-designer/deploy-project',
  SET_DEFAULT_WINDOW = 'ui-designer/set-default-window',
  SET_RESOURCE = 'ui-designer/set-resource',
  CLEAR_RESOURCE = 'ui-designer/clear-resource',
  RENAME_RESOURCE = 'ui-designer/rename-resource',
  SET_WINDOW = 'ui-designer/set-window',
  CLEAR_WINDOW = 'ui-designer/clear-window',
  RENAME_WINDOW = 'ui-designer/rename-window',
}

export { DesignerTabActionData, DefaultWindow };

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

export type UiComponent = Component;
export type UiResource = Mutable<DefinitionResource>;
export type UiControl = Mutable<Control>;

export interface UiPlugin extends UiPluginData {
  id: string; // id: instanceName:module.name
}

export interface UiWindow extends Omit<Mutable<Window>, 'controls'> {
  controls: UiControl[];
}

export interface UiOpenedProject extends OpenedProjectBase {
  components: Table<UiComponent>; // plugin points to plugin instanceName:module.name
  plugins: Table<UiPlugin>;

  resources: Table<UiResource>;

  windows: Table<UiWindow>;

  defaultWindow: DefaultWindow;
}

export type UiDesignerState = DesignerState<UiOpenedProject>;

export { UiElementPath, UiElementPathNode };
export type Usage = UiElementPath[];

export interface RefreshData {
  breakingOperations: UiBreakingOperation[];
  serverData: unknown;
}
