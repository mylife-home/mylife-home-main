export const enum ActionTypes {
  ONLINE = 'status/online',
  BUSY = 'status/busy',
  SET_ERROR = 'status/set-error',
  CLEAR_ERROR = 'status/clear-error',
}

export interface StatusState {
  online: boolean;
  busy: boolean;
  error: Error;
}
