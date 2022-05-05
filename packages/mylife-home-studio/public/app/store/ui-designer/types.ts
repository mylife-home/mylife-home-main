import { Component } from '../../../../shared/component-model';
import { UiBreakingOperation, UiPluginData, UiElementPath, UiElementPathNode, UpdateProjectNotification } from '../../../../shared/project-manager';
import { Window, Control, DefaultWindow, DefinitionResource, DefinitionStyle } from '../../../../shared/ui-model';
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
  SELECT = 'ui-designer/select',
  SET_DEFAULT_WINDOW = 'ui-designer/set-default-window',
  SET_RESOURCE = 'ui-designer/set-resource',
  CLEAR_RESOURCE = 'ui-designer/clear-resource',
  RENAME_RESOURCE = 'ui-designer/rename-resource',
  SET_STYLE = 'ui-designer/set-style',
  CLEAR_STYLE = 'ui-designer/clear-style',
  RENAME_STYLE = 'ui-designer/rename-style',
  NEW_WINDOW = 'ui-designer/new-window',
  CLEAR_WINDOW = 'ui-designer/clear-window',
  RENAME_WINDOW = 'ui-designer/rename-window',
  CLONE_WINDOW = 'ui-designer/clone-window',
  SET_WINDOW_PROPERTIES = 'ui-designer/set-window-properties',
  NEW_CONTROL = 'ui-designer/new-control',
  CLEAR_CONTROL = 'ui-designer/clear-control',
  RENAME_CONTROL = 'ui-designer/rename-control',
  CLONE_CONTROL = 'ui-designer/clone-control',
  SET_CONTROL_PROPERTIES = 'ui-designer/set-control-properties',
}

export namespace ActionPayloads {
  export type SetNotifier = { tabId: string; notifierId: string; };
  export type ClearAllNotifiers = void;
  export type RemoveOpenedProject = { tabId: string; };
  export type UpdateProject = { tabId: string; update: UpdateProjectNotification; }[];

  export type ValidateProject = { tabId: string; };
  export type RefreshComponentsFromOnline = { tabId: string; };
  export type RefreshComponentsFromProject = { tabId: string; projectId: string; };
  export type ApplyRefreshComponents = { tabId: string; serverData: unknown; };
  export type DeployProject = { tabId: string; };
  export type Select = { tabId: string; selection: Selection; };

  export type SetDefaultWindow = { tabId: string; defaultWindow: DefaultWindow; };
  export type SetResource = { tabId: string; resource: UiResource; };
  export type ClearResource = { resourceId: string; };
  export type RenameResource = { resourceId: string; newId: string; };
  export type SetStyle = { tabId: string; style: UiStyle; };
  export type ClearStyle = { styleId: string; };
  export type RenameStyle = { styleId: string; newId: string; };
  export type NewWindow = { tabId: string; newId: string; };
  export type ClearWindow = { windowId: string; };
  export type RenameWindow = { windowId: string; newId: string; };
  export type CloneWindow = { windowId: string; newId: string; };
  export type SetWindowProperties = { windowId: string; properties: Partial<Omit<UiWindow, 'id' | 'windowId' | 'controls'>>; };
  export type NewControl = { windowId: string; newId: string; x: number; y: number; };
  export type ClearControl = { controlId: string; };
  export type RenameControl = { controlId: string; newId: string; };
  export type CloneControl = { controlId: string; newId: string; };
  export type SetControlProperties = { controlId: string; properties: Partial<Omit<UiControl, 'id' | 'controlId'>>; };
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

export interface UiStyle extends Mutable<DefinitionStyle> {
  styleId: string; // id in project
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

export type SelectionType = 'project' | 'windows' | 'window' | 'resources' | 'styles' | 'components';

export interface Selection {
  type: SelectionType;
  id?: string;
}

export interface UiOpenedProject extends OpenedProjectBase {
  components: string[];
  plugins: string[];
  resources: string[];
  styles: string[];
  windows: string[];
  defaultWindow: DefaultWindow;
  selection: Selection;
}

export interface UiDesignerState {
  openedProjects: Table<UiOpenedProject>;
  components: Table<UiComponent>;
  plugins: Table<UiPlugin>;
  resources: Table<UiResource>;
  styles: Table<UiStyle>;
  windows: Table<UiWindow>;
  controls: Table<UiControl>;
}

export { UiElementPath, UiElementPathNode };
export type Usage = UiElementPath[];

export interface RefreshData {
  breakingOperations: UiBreakingOperation[];
  serverData: unknown;
}
