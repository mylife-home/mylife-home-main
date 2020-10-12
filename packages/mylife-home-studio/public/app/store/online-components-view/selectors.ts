import { AppState } from '../types';
import { getTabsCount } from '../tabs/selectors';
import { TabType } from '../tabs/types';

export const hasOnlineComponentsViewTab = (state: AppState) => getTabsCount(state, TabType.ONLINE_COMPONENTS_VIEW) > 0;

const getOnlineComponentsView = (state: AppState) => state.onlineComponentsView;
export const getNotifierId = (state: AppState) => getOnlineComponentsView(state).notifierId;
