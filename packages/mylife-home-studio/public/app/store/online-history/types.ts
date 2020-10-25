import { Table } from '../common/types';

export const enum ActionTypes {
  SET_NOTIFICATION = 'online-history/set-notification',
  CLEAR_NOTIFICATION = 'online-history/clear-notification',
  ADD_HISTORY_ITEMS = 'online-history/add-history-items'
}

export interface OnlineHistoryState {
  notifierId: string;
  items: Table<HistoryItem>;
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
  previousItemId?: string; // previous state history item change of this state (if initial === false)
}

export interface CriteriaDefinition {
  types: HistoryItemType[];
  instance: string;
  component: string;
  state: string;
}
