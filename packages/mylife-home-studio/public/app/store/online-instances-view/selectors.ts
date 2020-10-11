import { createSelector } from '@reduxjs/toolkit';
import { AppState } from '../types';
import { getTabsCount } from '../tabs/selectors';
import { TabType } from '../tabs/types';
import { NamedInstanceInfo } from './types';

export const hasOnlineInstancesViewTab = (state: AppState) => getTabsCount(state, TabType.ONLINE_INSTANCES_VIEW) > 0;

const getOnlineInstancesView = (state: AppState) => state.onlineInstancesView;
export const getNotifierId = (state: AppState) => getOnlineInstancesView(state).notifierId;

export const getInstancesInfos = createSelector(
  (state: AppState) => getOnlineInstancesView(state).instances,
  (map) => Object.entries(map).map(([instanceName, instanceInfo]) => ({ instanceName, ...instanceInfo } as NamedInstanceInfo))
);
