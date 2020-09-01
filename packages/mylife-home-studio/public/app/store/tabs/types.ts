export interface NewTabAction {
  id: string;
  closable: boolean;
}

export interface MoveTabAction {
  id: string;
  position: number;
}

export interface TabIdAction {
  id: string;
}

export enum ActionTypes {
  NEW = 'tabs/new',
  CLOSE = 'tabs/close',
  MOVE = 'tabs/move',
  ACTIVATE = 'tabs/activate'
}

export interface TabState {
  id: string;
  closable: boolean;
  active: boolean;
  index: number;
}

export interface TabsState {
  byId: { [id: string]: TabState; };
  allIds: string[];
  activeId: string;
}
