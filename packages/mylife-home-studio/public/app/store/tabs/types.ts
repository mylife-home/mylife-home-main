export enum TabType {
  START_PAGE = 'start-page',
  CORE_DESIGNER = 'core-designer'
}

export interface NewTabAction {
  id: string;
  type: TabType;
  title: string;
  closable: boolean;
}

export interface MoveTabAction {
  id: string;
  position: number;
}

export interface ChangeTabTitleAction {
  id: string;
  title: string;
}

export interface TabIdAction {
  id: string;
}

export enum ActionTypes {
  NEW = 'tabs/new',
  CLOSE = 'tabs/close',
  MOVE = 'tabs/move',
  ACTIVATE = 'tabs/activate',
  CHANGE_TITLE = 'tabs/change-title',
}

export interface TabState {
  id: string;
  type: TabType;
  title: string;
  closable: boolean;
  active: boolean;
  index: number;
}

export interface TabsState {
  byId: { [id: string]: TabState; };
  allIds: string[];
  activeId: string;
}
