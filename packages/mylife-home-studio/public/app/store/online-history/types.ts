export const enum ActionTypes {
  SET_NOTIFICATION = 'online-history/set-notification',
  CLEAR_NOTIFICATION = 'online-history/clear-notification',
  ADD_HISTORY_ITEMS = 'online-history/add-history-items'
}

export interface OnlineHistoryState {
  notifierId: string;
  items: HistoryItem[];
}

export type HistoryItemType = 'instance-set' | 'instance-clear' | 'component-set' | 'component-clear' | 'state-set';

export interface HistoryItem {
  id: string;
  timestamp: Date;
  type: HistoryItemType;
}

export interface InstanceHistoryItem extends HistoryItem {
  type: 'instance-set' | 'instance-clear';
  instanceName: string;
}

export interface ComponentHistoryItem extends HistoryItem {
  type: 'component-set' | 'component-clear';
  instanceName: string;
  componentId: string;
}

export interface StateHistoryItem extends HistoryItem {
  type: 'state-set';
  instanceName: string;
  componentId: string;
  stateName: string;
  stateValue: any;
  initial: boolean;
}
