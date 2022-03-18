import { Component } from '../../../../shared/component-model';
import { UiBreakingOperation, UiPluginData, UiElementPath, UiElementPathNode } from '../../../../shared/project-manager';
import { Window, Control, DefaultWindow, DefinitionResource } from '../../../../shared/ui-model';
import { DesignerTabActionData, OpenedProjectBase } from '../common/designer-types';
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
  CLONE_WINDOW = 'ui-designer/clone-window',
  SET_CONTROL = 'ui-designer/set-control',
  CLEAR_CONTROL = 'ui-designer/clear-control',
  RENAME_CONTROL = 'ui-designer/rename-control',
  SELECT = 'ui-designer/select',
}

export { DesignerTabActionData, DefaultWindow };

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

export interface UiComponent extends Component {
  // plugin points to store plugin id: `projectId:instanceName:module.name`
  componentId: string; // id in project
}

export interface UiResource extends Mutable<DefinitionResource> {
  resourceId: string; // id in project
}

export interface UiControl extends Mutable<Control> {
  controlId: string; // id in window
}

export interface UiPlugin extends UiPluginData {
  id: string; // id: projectId:instanceName:module.name
}

export interface UiWindow extends Omit<Mutable<Window>, 'controls'> {
  windowId: string; // id in project
  controls: string[];
}

export type SelectionType = 'project' | 'windows' | 'window' | 'resources' | 'components';

export interface Selection {
  type: SelectionType;
  id?: string;
}

export interface UiOpenedProject extends OpenedProjectBase {
  components: string[];
  plugins: string[];
  resources: string[];
  windows: string[];
  defaultWindow: DefaultWindow;
  selection: Selection;
}

export interface UiDesignerState {
  openedProjects: Table<UiOpenedProject>;
  components: Table<UiComponent>;
  plugins: Table<UiPlugin>;
  resources: Table<UiResource>;
  windows: Table<UiWindow>;
  controls: Table<UiControl>;
}

export { UiElementPath, UiElementPathNode };
export type Usage = UiElementPath[];

export interface RefreshData {
  breakingOperations: UiBreakingOperation[];
  serverData: unknown;
}
