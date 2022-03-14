import { createSelector } from '@reduxjs/toolkit';
import { AppState } from '../types';
import { UiControl, Usage } from './types';

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
};

export const getComponentAndPlugin = (state: AppState, tabId: string, id: string) => {
  const project = getOpenedProject(state, tabId);
  const component = project.components.byId[id];
  if (!component) {
    return;
  }

  const plugin = project.plugins.byId[component.plugin];
  return { component, plugin };
};

export const getComponentMemberValueType = (state: AppState, tabId: string, componentId: string, memberName: string) => {
  const project = getOpenedProject(state, tabId);
  const component = project.components.byId[componentId];
  if (!component) {
    return;
  }

  const plugin = project.plugins.byId[component.plugin];
  return plugin.members[memberName]?.valueType;
};

// components data does not change often in the project lifecycle
function makeGetComponentsData() {
  return createSelector(
    getOpenedProject,
    (project) => ({ components: project.components, plugins: project.plugins })
  );
}

export function makeGetComponentsAndPlugins() {
  const getComponentsData = makeGetComponentsData();
  return createSelector(
    getComponentsData,
    ({ components, plugins }) => components.allIds.map(id => {
      const component = components.byId[id];
      const plugin = plugins.byId[component.plugin];
      return { component, plugin };
    })
  );
}


export const getResourcesIds = (state: AppState, tabId: string) => {
  const project = getOpenedProject(state, tabId);
  return project.resources.allIds;
};

export const getResource = (state: AppState, tabId: string, id: string) => {
  const project = getOpenedProject(state, tabId);
  return project.resources.byId[id];
};

export function makeGetResourceUsage() {
  return createSelector(
    getOpenedProject,
    (state: AppState, tabId: string, resourceId: string) => resourceId,
    (project, resourceId) => {
      const usage: Usage = [];

      for (const wid of project.windows.allIds) {
        const window = project.windows.byId[wid];

        if (window.backgroundResource === resourceId) {
          usage.push([{ type: 'window', id: wid }]);
        }

        for (const control of window.controls) {
          if (isResourceUsedByControl(control, resourceId)) {
            usage.push([
              { type: 'window', id: wid },
              { type: 'control', id: control.id },
            ]);
          }
        }
      }

      return usage;
    }
  );
};

function isResourceUsedByControl(control: UiControl, resourceId: string) {
  const { display } = control;
  if (!display) {
    return false;
  }

  if (display.defaultResource === resourceId) {
    return true;
  }

  for(const item of display.map) {
    if(item.resource === resourceId) {
      return true;
    }
  }

  return false;
}

export const getWindowsIds = (state: AppState, tabId: string) => {
  const project = getOpenedProject(state, tabId);
  return project.windows.allIds;
};

export const getWindow = (state: AppState, tabId: string, id: string) => {
  const project = getOpenedProject(state, tabId);
  return project.windows.byId[id];
};

export function makeGetWindowUsage() {
  return createSelector(
    getOpenedProject,
    (state: AppState, tabId: string, windowId: string) => windowId,
    (project, windowId) => {
      const usage: Usage = [];

      for (const [key, value] of Object.entries(project.defaultWindow)) {
        if (value === windowId) {
          usage.push([{ type: 'defaultWindow', id: key }]);
        }
      }

      for (const wid of project.windows.allIds) {
        const window = project.windows.byId[wid];
        for (const control of window.controls) {
          for (const aid of ['primaryAction', 'secondaryAction'] as ('primaryAction' | 'secondaryAction')[]) {
            if (control[aid]?.window?.id === windowId) {
              usage.push([
                { type: 'window', id: wid },
                { type: 'control', id: control.id },
                { type: 'action', id: aid },
              ]);
            }
          }
        }
      }

      return usage;
    }
  );
};

export const getDefaultWindow = (state: AppState, tabId: string) => {
  const project = getOpenedProject(state, tabId);
  return project.defaultWindow;
};

export const getSelection = (state: AppState, tabId: string) => {
  const project = getOpenedProject(state, tabId);
  return project.selection;
}