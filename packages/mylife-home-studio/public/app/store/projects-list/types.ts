import { CoreProjectInfo, UiProjectInfo } from '../../../../shared/project-manager';
import { Table } from '../common/types';

export const enum ActionTypes {
  SET_NOTIFICATION = 'projects-list/set-notification',
  CLEAR_NOTIFICATION = 'projects-list/clear-notification',
  PUSH_UPDATES = 'projects-list/push-updates'
}

export interface CoreProjectItem extends CoreProjectInfo {
  id: string;
  name: string;
}

export interface UiProjectItem extends UiProjectInfo {
  id: string;
  name: string;
}

export interface ProjectsListState {
  notifierId: string;
  coreProjects: Table<CoreProjectItem>;
  uiProjects: Table<UiProjectItem>;
}

export interface Update {
  // TODO
}