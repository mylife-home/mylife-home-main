import { AppState } from '../types';
import { getTabsCount } from '../tabs/selectors';
import { TabType } from '../tabs/types';

export const hasOnlineLogsTab = (state: AppState) => getTabsCount(state, TabType.ONLINE_LOGS) > 0;

const getOnlineLogs = (state: AppState) => state.onlineLogs;
export const getNotifierId = (state: AppState) => getOnlineLogs(state).notifierId;
export const getItems = (state: AppState) => getOnlineLogs(state).items;