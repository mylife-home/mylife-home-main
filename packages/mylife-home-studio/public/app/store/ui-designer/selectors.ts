import { AppState } from '../types';

const getOpenedProjects = (state: AppState) => state.uiDesigner.openedProjects;
export const hasOpenedProjects = (state: AppState) => getOpenedProjects(state).allIds.length > 0;
export const getOpenedProject = (state: AppState, tabId: string) => getOpenedProjects(state).byId[tabId];

export const getOpenedProjectsIdAndProjectIdList = (state: AppState) => {
  const openedProjects = getOpenedProjects(state);
  return Object.values(openedProjects.byId).map(({ id, projectId }) => ({ id, projectId }));
};

// TODO: memoized selector
export const getOpenedProjectIdByNotifierId = (state: AppState, notifierId: string) => {
  const projects = getOpenedProjects(state);
  for (const project of Object.values(projects.byId)) {
    if (project.notifierId === notifierId) {
      return project.id;
    }
  }
};
