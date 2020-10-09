import { AppState } from '../types';
import { getTabsCount } from '../tabs/selectors';
import { TabType } from '../tabs/types';

export const hasOnlineInstancesViewTab = (state: AppState) => getTabsCount(state, TabType.ONLINE_INSTANCES_VIEW) > 0;

const getOnlineInstancesView = (state: AppState) => state.onlineInstancesView;
export const getNotifierId = (state: AppState) => getOnlineInstancesView(state).notifierId;
export const getInstancesInfos = (state: AppState) => getOnlineInstancesView(state).instances;