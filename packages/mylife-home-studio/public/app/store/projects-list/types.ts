export const enum ActionTypes {
  SET_NOTIFICATION = 'projects-list/set-notification',
  CLEAR_NOTIFICATION = 'projects-list/clear-notification',
  PUSH_UPDATES = 'projects-list/push-updates'
}

export interface ProjectsListState {
  notifierId: string;
}

export interface Update {
  // TODO
}