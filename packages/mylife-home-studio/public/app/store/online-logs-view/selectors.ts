import { AppState } from '../types';
import { getTabsCount } from '../tabs/selectors';
import { TabType } from '../tabs/types';

export const hasOnlineLogsViewTabCount = (state: AppState) => getTabsCount(state, TabType.ONLINE_LOGS_VIEW) > 0;

const getOnlineLogsView = (state: AppState) => state.onlineLogsView;
export const hasNotifications = (state: AppState) => !!getOnlineLogsView(state).notificationId;