export const enum ActionTypes {
  ONLINE = 'status/online',
  SET_ERROR = 'status/set-error',
  CLEAR_ERROR = 'status/clear-error',
}

export interface StatusState {
  online: boolean;
  error: Error;
}
