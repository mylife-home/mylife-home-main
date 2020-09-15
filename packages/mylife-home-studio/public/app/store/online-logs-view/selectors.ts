import { AppState } from '../types';
import { getTabsCount } from '../tabs/selectors';
import { TabType } from '../tabs/types';

export const hasOnlineLogsViewTab = (state: AppState) => getTabsCount(state, TabType.ONLINE_LOGS_VIEW) > 0;

const getOnlineLogsView = (state: AppState) => state.onlineLogsView;
export const getNotifierId = (state: AppState) => getOnlineLogsView(state).notifierId;