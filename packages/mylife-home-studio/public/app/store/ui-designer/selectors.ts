import { createSelector } from '@reduxjs/toolkit';
import { AppState } from '../types';

const getOpenedProjects = (state: AppState) => state.uiDesigner.openedProjects;
export const hasOpenedProjects = (state: AppState) => getOpenedProjects(state).allIds.length > 0;
export const getOpenedProject = (state: AppState, tabId: string) => getOpenedProjects(state).byId[tabId];

export const getOpenedProjectsIdAndProjectIdList = (state: AppState) => {
  const openedProjects = getOpenedProjects(state);
  return Object.values(openedProjects.byId).map(({ id, projectId }) => ({ id, projectId }));
};

const projectIdByNotifierIdMap = createSelector(
  getOpenedProjects,
  (projects) => {
    const map = new Map<string, string>();
    for (const project of Object.values(projects.byId)) {
      map.set(project.notifierId, project.id);
    }
    return map;
  },
);

export const getOpenedProjectIdByNotifierId = (state: AppState, notifierId: string) => {
  const map = projectIdByNotifierIdMap(state);
  return map.get(notifierId);
};

export const getComponentsIds = (state: AppState, tabId: string) => {
  const project = getOpenedProject(state, tabId);
  return project.components.allIds;
}

export const getComponentAndPlugin = (state: AppState, tabId: string, id: string) => {
  const project = getOpenedProject(state, tabId);
  const component = project.components.byId[id];
  if (!component) {
    return;
  }

  const plugin = project.plugins.byId[component.plugin];
  return { component, plugin };
}

export const getResourcesIds = (state: AppState, tabId: string) => {
  const project = getOpenedProject(state, tabId);
  return project.resources.allIds;
}

export const getResource = (state: AppState, tabId: string, id: string) => {
  const project = getOpenedProject(state, tabId);
  return project.resources.byId[id];
}

export const getWindowsIds = (state: AppState, tabId: string) => {
  const project = getOpenedProject(state, tabId);
  return project.windows.allIds;
}

export const getWindow = (state: AppState, tabId: string, id: string) => {
  const project = getOpenedProject(state, tabId);
  return project.windows.byId[id];
}
