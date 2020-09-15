import { AppState } from '../types';
import { createSelector } from '@reduxjs/toolkit';
import { TabType } from './types';

const getTabs = (state: AppState) => state.tabs;
export const getTab = (state: AppState, id: string) => getTabs(state).byId[id];
export const getSelectedTabId = (state: AppState) => getTabs(state).activeId;

export const getTabList = createSelector(
  (state: AppState) => getTabs(state).byId,
  (state: AppState) => getTabs(state).allIds,
  (byId, allIds) => allIds.map(id => byId[id])
);

export const getTabsCount = (state: AppState, type: TabType) => {
  const tabs = getTabs(state);
  return tabs.allIds.filter(id => tabs.byId[id].type === type).length;
}