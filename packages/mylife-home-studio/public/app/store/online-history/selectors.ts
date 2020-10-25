import { AppState } from '../types';
import { getTabsCount } from '../tabs/selectors';
import { TabType } from '../tabs/types';

export const hasOnlineHistoryTab = (state: AppState) => getTabsCount(state, TabType.ONLINE_HISTORY) > 0;

const getOnlineHistory = (state: AppState) => state.onlineHistory;
export const getNotifierId = (state: AppState) => getOnlineHistory(state).notifierId;
export const getItemsIds = (state: AppState) => getOnlineHistory(state).items.allIds;
export const getItem = (state: AppState, id: string) => getOnlineHistory(state).items.byId[id];