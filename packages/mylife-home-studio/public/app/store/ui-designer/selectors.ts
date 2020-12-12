import { AppState } from '../types';

const getUiDesignerOpenedProjects = (state: AppState) => state.uiDesigner.openedProjects;
export const hasUiDesignerOpenedProjects = (state: AppState) => getUiDesignerOpenedProjects(state).allIds.length > 0;
export const getUiDesignerOpenedProject = (state: AppState, tabId: string) => getUiDesignerOpenedProjects(state).byId[tabId];

export const getUiDesignerOpenedProjectsIdAndProjectIdList = (state: AppState) => {
  const openedProjects = getUiDesignerOpenedProjects(state);
  return Object.values(openedProjects.byId).map(({ id, projectId }) => ({ id, projectId }));
};