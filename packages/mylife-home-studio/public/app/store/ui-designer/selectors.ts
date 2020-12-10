import { AppState } from '../types';

const getUiDesigner = (state: AppState, tabId: string) => state.uiDesigner.openedProjects.byId[tabId];
// TODO