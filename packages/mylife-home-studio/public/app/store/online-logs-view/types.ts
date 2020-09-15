export const enum ActionTypes {
  SET_NOTIFICATION = 'online-logs-view/set-notification',
  CLEAR_NOTIFICATION = 'online-logs-view/clear-notification',
  ADD_RECORD = 'online-logs-view/add-record'
}

export interface OnlineLogsViewState {
  notifierId: string;
  records: LogRecord[];
}

// TODO: adapt to view or share with backend
export interface LogRecord {
  name: string;
  instanceName: string;
  hostname: string;
  pid: number;
  level: number;
  msg: string;
  time: string;
  v: number;
  err?: {
    message: string;
    name: string;
    stack: string;
  };
}