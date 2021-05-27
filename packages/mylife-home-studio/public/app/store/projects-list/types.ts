import { CoreProjectInfo, UiProjectInfo, ProjectType } from '../../../../shared/project-manager';
import { PluginUsage } from '../../../../shared/component-model';
import { Table } from '../common/types';

export const enum ActionTypes {
  SET_NOTIFICATION = 'projects-list/set-notification',
  CLEAR_NOTIFICATION = 'projects-list/clear-notification',
  PUSH_UPDATES = 'projects-list/push-updates',

  IMPORT_V1 = 'projects-list/import-v1',
  CREATE_NEW = 'projects-list/create-new',
  DUPLICATE = 'projects-list/duplicate',
  RENAME = 'projects-list/rename',
  DELETE = 'projects-list/delete',
}

export { ProjectType, PluginUsage };

export interface BaseProjectItem {
  id: string; // = name
}

export interface CoreProjectItem extends BaseProjectItem, CoreProjectInfo {
}

export interface UiProjectItem extends BaseProjectItem, UiProjectInfo {
}

export interface ProjectsListState {
  notifierId: string;
  coreProjects: Table<CoreProjectItem>;
  uiProjects: Table<UiProjectItem>;
}

export interface Update {
  operation: 'set' | 'clear' | 'rename';
  type: ProjectType;
}

export interface SetProject extends Update {
  operation: 'set';
  item: BaseProjectItem;
}

export interface ClearProject extends Update {
  operation: 'clear';
  id: string;
}

export interface RenameProject extends Update {
  operation: 'rename';
  oldId: string;
  newId: string;
}
