import { createSelector } from '@reduxjs/toolkit';
import { AppState } from '../types';
import { UiControl, UiPlugin, Usage } from './types';

const getUiDesigner = (state: AppState) => state.uiDesigner;
const getOpenedProjects = (state: AppState) => getUiDesigner(state).openedProjects;
const getComponentsTable = (state: AppState) => getUiDesigner(state).components;
const getPluginsTable = (state: AppState) => getUiDesigner(state).plugins;
const getWindowsTable = (state: AppState) => getUiDesigner(state).windows;

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
  return project.components;
};

export const getComponentAndPlugin = (state: AppState, componentId: string) => {
  const designerState = getUiDesigner(state);
  const component = designerState.components.byId[componentId];
  if (!component) {
    return;
  }

  const plugin = designerState.plugins.byId[component.plugin];
  return { component, plugin };
};

export const getComponentMemberValueType = (state: AppState, componentId: string, memberName: string) => {
  const componentAndPlugin = getComponentAndPlugin(state, componentId);
  if (!componentAndPlugin) {
    return;
  }

  const { plugin } = componentAndPlugin;
  return plugin.members[memberName]?.valueType;
};

export function makeGetComponentsAndPlugins() {
  return createSelector(
    getOpenedProject,
    getComponentsTable,
    getPluginsTable,
    (project, components, plugins) => project.components.map(id => {
      const component = components.byId[id];
      const plugin = plugins.byId[component.plugin];
      return { component, plugin };
    })
  );
}

export function makeGetPluginsMap() {
  return createSelector(
    getOpenedProject,
    getComponentsTable,
    getPluginsTable,
    (project, components, plugins) => {
      const map = new Map<string, UiPlugin>();

      for(const id of project.components) {
        const component = components.byId[id];
        const plugin = plugins.byId[component.plugin];
        map.set(component.componentId, plugin);
      }

      return map;
    }
  );
}

export const getResourcesIds = (state: AppState, tabId: string) => {
  const project = getOpenedProject(state, tabId);
  return project.resources;
};

export const getResource = (state: AppState, resourceId: string) => {
  const designerState = getUiDesigner(state);
  return designerState.resources.byId[resourceId];
};

export function makeGetResourceUsage() {
  return createSelector(
    getOpenedProject,
    getWindowsTable,
    (state: AppState, tabId: string, resourceId: string) => resourceId,
    (project, windows, resourceId) => {
      const usage: Usage = [];

      for (const wid of project.windows) {
        const window = windows.byId[wid];

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
  return project.windows;
};

export const getWindow = (state: AppState, windowId: string) => {
  const designerState = getUiDesigner(state);
  return designerState.windows.byId[windowId];
};

export function makeGetWindowUsage() {
  return createSelector(
    getOpenedProject,
    getWindowsTable,
    (state: AppState, tabId: string, windowId: string) => windowId,
    (project, windows, windowId) => {
      const usage: Usage = [];

      for (const [key, value] of Object.entries(project.defaultWindow)) {
        if (value === windowId) {
          usage.push([{ type: 'defaultWindow', id: key }]);
        }
      }

      for (const wid of project.windows) {
        const window = windows.byId[wid];
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

export const getWindowsMap = (state: AppState) => getWindowsTable(state).byId;

export const getDefaultWindow = (state: AppState, tabId: string) => {
  const project = getOpenedProject(state, tabId);
  return project.defaultWindow;
};

export const getSelection = (state: AppState, tabId: string) => {
  const project = getOpenedProject(state, tabId);
  return project.selection;
}