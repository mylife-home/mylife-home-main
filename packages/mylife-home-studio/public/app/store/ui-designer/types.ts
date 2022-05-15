import { Component } from '../../../../shared/component-model';
import { UiBreakingOperation, UiPluginData, UiElementPath, UiElementPathNode, UpdateProjectNotification, UiWindowData, UiControlData, UiResourceData, UiStyleData, UiTemplateData, UiViewData, UiTemplateInstanceData } from '../../../../shared/project-manager';
import { DefaultWindow } from '../../../../shared/ui-model';
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
  NEW_TEMPLATE = 'ui-designer/new-template',
  CLEAR_TEMPLATE = 'ui-designer/clear-template',
  RENAME_TEMPLATE = 'ui-designer/rename-template',
  CLONE_TEMPLATE = 'ui-designer/clone-template',
  SET_TEMPLATE_PROPERTIES = 'ui-designer/set-template-properties',
  NEW_CONTROL = 'ui-designer/new-control',
  CLEAR_CONTROL = 'ui-designer/clear-control',
  RENAME_CONTROL = 'ui-designer/rename-control',
  CLONE_CONTROL = 'ui-designer/clone-control',
  SET_CONTROL_PROPERTIES = 'ui-designer/set-control-properties',
  NEW_TEMPLATE_INSTANCE = 'ui-designer/new-template-instance',
  CLEAR_TEMPLATE_INSTANCE = 'ui-designer/clear-template-instance',
  RENAME_TEMPLATE_INSTANCE = 'ui-designer/rename-template-instance',
  CLONE_TEMPLATE_INSTANCE = 'ui-designer/clone-template-instance',
  SET_TEMPLATE_INSTANCE_PROPERTIES = 'ui-designer/set-template-instance-properties',
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
  export type SetWindowProperties = { windowId: string; properties: Partial<Omit<UiWindow, 'id' | 'windowId' | 'controls' | 'templates'>>; };
  export type NewTemplate = { tabId: string; newId: string; };
  export type ClearTemplate = { templateId: string; };
  export type RenameTemplate = { templateId: string; newId: string; };
  export type CloneTemplate = { templateId: string; newId: string; };
  export type SetTemplateProperties = { templateId: string; properties: Partial<Omit<UiTemplate, 'id' | 'templateId' | 'controls' | 'templates'>>; };
  export type NewControl = { viewType: UiViewType; viewId: string; newId: string; x: number; y: number; type: 'display' | 'text' };
  export type ClearControl = { controlId: string; };
  export type RenameControl = { controlId: string; newId: string; };
  export type CloneControl = { controlId: string; newId: string; targetViewType: UiViewType; targetViewId: string; };
  export type SetControlProperties = { controlId: string; properties: Partial<Omit<UiControl, 'id' | 'controlId'>>; };
  export type NewTemplateInstance = { viewType: UiViewType; viewId: string; newId: string; templateId: string; x: number; y: number; };
  export type ClearTemplateInstance = { templateInstanceId: string; };
  export type RenameTemplateInstance = { templateInstanceId: string; newId: string; };
  export type CloneTemplateInstance = { templateInstanceId: string; newId: string; };
  export type SetTemplateInstanceProperties = { templateInstanceId: string; properties: Partial<Omit<UiTemplateInstance, 'id' | 'templateInstanceId'>>; };
}

export { DesignerTabActionData, DefaultWindow };

export interface UiResource extends UiResourceData {
  id: string;
  resourceId: string; // id in project
}

export interface UiStyle extends UiStyleData {
  id: string;
  styleId: string; // id in project
}

export type UiViewType = 'window' | 'template';

export interface UiView extends Omit<UiViewData, 'controls' | 'templates'> {
  id: string;
  controls: string[];
  templates: string[];
}

export interface UiWindow extends UiView, Omit<UiWindowData, 'controls' | 'templates'> {
  windowId: string; // id in project
}

export interface UiTemplate extends UiView, Omit<UiTemplateData, 'controls' | 'templates'> {
  templateId: string; // id in project
}

export interface UiTemplateInstance extends UiTemplateInstanceData {
  id: string;
  templateInstanceId: string; // id in view
}

export interface UiControl extends UiControlData {
  id: string;
  controlId: string; // id in view
}

export type SelectionType = 'project' | 'windows' | 'window' | 'templates' | 'template' | 'resources' | 'styles' | 'components';

export interface Selection {
  type: SelectionType;
  id?: string;
}

export interface UiComponent extends Component {
  // plugin points to store plugin id: `projectId:instanceName:module.name`
  componentId: string; // id in project
}

export interface UiPlugin extends UiPluginData {
  id: string; // id: projectId:instanceName:module.name
}

export interface UiOpenedProject extends OpenedProjectBase {
  components: string[];
  plugins: string[];
  resources: string[];
  styles: string[];
  windows: string[];
  templates: string[];
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
  templates: Table<UiTemplate>;
  controls: Table<UiControl>;
  templateInstances: Table<UiTemplateInstance>;
}

export { UiElementPath, UiElementPathNode };
export type Usage = UiElementPath[];

export interface RefreshData {
  breakingOperations: UiBreakingOperation[];
  serverData: unknown;
}
