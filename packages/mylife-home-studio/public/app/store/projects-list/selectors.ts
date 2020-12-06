import { AppState } from '../types';
import { getTabsCount } from '../tabs/selectors';
import { TabType } from '../tabs/types';

// projects list is used by start page
export const hasStartPageTab = (state: AppState) => getTabsCount(state, TabType.START_PAGE) > 0;

const getProjectLists = (state: AppState) => state.projectsList;
export const getNotifierId = (state: AppState) => getProjectLists(state).notifierId;

export const getCoreProjectsIds = (state: AppState) => getProjectLists(state).coreProjects.allIds;
export const getCoreProjectInfo = (state: AppState, id: string) => getProjectLists(state).coreProjects.byId[id];

export const getUiProjectsIds = (state: AppState) => getProjectLists(state).uiProjects.allIds;
export const getUiProjectInfo = (state: AppState, id: string) => getProjectLists(state).uiProjects.byId[id];
