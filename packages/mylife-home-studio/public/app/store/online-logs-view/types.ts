export const enum ActionTypes {
  SET_NOTIFICATION = 'online-logs-view/set-notification',
  CLEAR_NOTIFICATION = 'online-logs-view/clear-notification',
  ADD_LOG_ITEMS = 'online-logs-view/add-log-items'
}

export interface OnlineLogsViewState {
  notifierId: string;
  items: LogItem[];
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
  err: {
    message: string;
    name: string;
    stack: string;
  };
}