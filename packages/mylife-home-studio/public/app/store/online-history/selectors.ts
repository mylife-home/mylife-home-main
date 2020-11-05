import { createSelector } from '@reduxjs/toolkit';
import matcher from 'matcher';
import { AppState } from '../types';
import { getTabsCount } from '../tabs/selectors';
import { TabType } from '../tabs/types';
import { ComponentHistoryItem, CriteriaDefinition, HistoryItem, InstanceHistoryItem, StateHistoryItem } from './types';

export const hasOnlineHistoryTab = (state: AppState) => getTabsCount(state, TabType.ONLINE_HISTORY) > 0;

const getOnlineHistory = (state: AppState) => state.onlineHistory;
export const getNotifierId = (state: AppState) => getOnlineHistory(state).notifierId;
const getItemsTable = (state: AppState) => getOnlineHistory(state).items;
export const getItem = (state: AppState, id: string) => getItemsTable(state).byId[id];

export const makeGetFilteredItemsIds = () => createSelector(
  [
    getItemsTable,
    (_: AppState, criteria: CriteriaDefinition) => criteria,
  ], 
  (table, criteria) => {
    let ids = table.allIds;

    if (criteria.types) {
      const set = new Set(criteria.types);
      ids = ids.filter(id => set.has(table.byId[id].type));
    }

    if (criteria.instance) {
      ids = ids.filter(id => {
        const instanceName = findInstanceName(table.byId[id]);
        return matcher.isMatch(instanceName, criteria.instance);
      });
    }

    if (criteria.component) {
      ids = ids.filter(id => {
        const componentId = findComponentId(table.byId[id]);
        return componentId && matcher.isMatch(componentId, criteria.component);
      });
    }

    if (criteria.state) {
      ids = ids.filter(id => {
        const stateName = findStateName(table.byId[id]);
        return stateName && matcher.isMatch(stateName, criteria.state);
      });
    }

    return ids.slice().reverse();
  }
);

function findInstanceName(item: HistoryItem) {
  switch (item.type) {
    case 'instance-set':
    case 'instance-clear':
      return (item as InstanceHistoryItem).instanceName;
    case 'component-set':
    case 'component-clear':
      return (item as ComponentHistoryItem).instanceName;
    case 'state-set':
      return (item as StateHistoryItem).instanceName;
  }
}

function findComponentId(item: HistoryItem) {
  switch (item.type) {
    case 'instance-set':
    case 'instance-clear':
      return null;
    case 'component-set':
    case 'component-clear':
      return (item as ComponentHistoryItem).componentId;
    case 'state-set':
      return (item as StateHistoryItem).componentId;
  }
}

function findStateName(item: HistoryItem) {
  switch (item.type) {
    case 'instance-set':
    case 'instance-clear':
    case 'component-set':
    case 'component-clear':
      return null;
    case 'state-set':
      return (item as StateHistoryItem).stateName;
  }
}
