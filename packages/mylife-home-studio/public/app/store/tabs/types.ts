import { Table } from '../common/types';

export const enum TabType {
  START_PAGE = 'start-page',
  CORE_DESIGNER = 'core-designer',
  UI_DESIGNER = 'ui-designer',
  ONLINE_COMPONENTS_VIEW = 'online-components-view',
  ONLINE_HISTORY = 'online-history',
  ONLINE_INSTANCES_VIEW = 'online-entities-view',
  ONLINE_LOGS = 'online-logs',
  DEPLOY = 'deploy',
}

export interface TabActionData { }

export interface NewTabAction {
  id: string;
  type: TabType;
  title: string;
  closable: boolean;
  data: TabActionData;
}

export interface MoveTabAction {
  id: string;
  position: number;
}

export interface UpdateTabAction {
  id: string;
  title: string;
  data: TabActionData;
}

export interface TabIdAction {
  id: string;
}

export const enum ActionTypes {
  NEW = 'tabs/new',
  CLOSE = 'tabs/close',
  MOVE = 'tabs/move',
  ACTIVATE = 'tabs/activate',
  UPDATE = 'tabs/update',
}

export interface TabState {
  id: string;
  type: TabType;
  title: string;
  closable: boolean;
  active: boolean;
  index: number;
}

export interface TabsState extends Table<TabState> {
  activeId: string;
}
