import { AppState } from '../types';
import { createSelector } from '@reduxjs/toolkit';

const getTabs = (state: AppState) => state.tabs;
export const getTab = (state: AppState, id: string) => getTabs(state).byId[id];
export const getSelectedTabId = (state: AppState) => getTabs(state).activeId;

export const getTabList = createSelector(
  (state: AppState) => getTabs(state).byId,
  (state: AppState) => getTabs(state).allIds,
  (byId, allIds) => allIds.map(id => byId[id])
)