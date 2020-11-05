import { AppState } from '../types';
import { getTabsCount } from '../tabs/selectors';
import { TabType } from '../tabs/types';
// import { ComponentHistoryItem, CriteriaDefinition, HistoryItem, InstanceHistoryItem, StateHistoryItem } from './types';

export const hasDeployTab = (state: AppState) => getTabsCount(state, TabType.DEPLOY) > 0;

const getDeploy = (state: AppState) => state.deploy;
export const getNotifierId = (state: AppState) => getDeploy(state).notifierId;
// const getItemsTable = (state: AppState) => getDeploy(state).items;
// export const getItem = (state: AppState, id: string) => getItemsTable(state).byId[id];
