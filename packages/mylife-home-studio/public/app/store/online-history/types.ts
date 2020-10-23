export const enum ActionTypes {
  SET_NOTIFICATION = 'online-history/set-notification',
  CLEAR_NOTIFICATION = 'online-history/clear-notification',
  ADD_HISTORY_ITEMS = 'online-history/add-history-items'
}

export interface OnlineHistoryState {
  notifierId: string;
  items: HistoryItem[];
}

export interface HistoryItem {
  // TODO
}