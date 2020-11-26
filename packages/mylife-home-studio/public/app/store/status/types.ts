import { Table } from '../common/types';

export const enum ActionTypes {
  ONLINE = 'status/online',
  BEGIN_REQUEST = 'status/begin-request',
  END_REQUEST = 'status/end-request',
  SET_ERROR = 'status/set-error',
  CLEAR_ERROR = 'status/clear-error',
}

export interface RunningRequest {
  id: string;
  service: string;
  begin: Date;
}

export interface StatusState {
  online: boolean;
  runningRequests: Table<RunningRequest>;
  error: Error;
}
