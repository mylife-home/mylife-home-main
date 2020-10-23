export const enum ActionTypes {
  SET_NOTIFICATION = 'online-logs/set-notification',
  CLEAR_NOTIFICATION = 'online-logs/clear-notification',
  ADD_LOG_ITEMS = 'online-logs/add-log-items'
}

export interface OnlineLogsState {
  notifierId: string;
  items: LogItem[];
}

export interface LogError {
  message: string;
  name: string;
  stack: string;
}

export interface LogItem {
  id: string;
  name: string;
  instanceName: string;
  hostname: string;
  pid: number;
  level: number;
  msg: string;
  time: Date;
  err: LogError;
}