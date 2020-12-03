import { AppState } from '../types';
import { getTabsCount } from '../tabs/selectors';
import { TabType } from '../tabs/types';

// projects list is used by start page
export const hasStartPageTab = (state: AppState) => getTabsCount(state, TabType.START_PAGE) > 0;

const getProjectLists = (state: AppState) => state.projectsList;
export const getNotifierId = (state: AppState) => getProjectLists(state).notifierId;
//export const getItems = (state: AppState) => getOnlineLogs(state).items;