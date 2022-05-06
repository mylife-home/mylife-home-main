import { createSelector } from '@reduxjs/toolkit';
import { AppState } from '../types';
import { UiControl, UiPlugin, Usage } from './types';

const getUiDesigner = (state: AppState) => state.uiDesigner;
const getOpenedProjects = (state: AppState) => getUiDesigner(state).openedProjects;
const getComponentsTable = (state: AppState) => getUiDesigner(state).components;
const getPluginsTable = (state: AppState) => getUiDesigner(state).plugins;
const getResourcesTable = (state: AppState) => getUiDesigner(state).resources;
const getStylesTable = (state: AppState) => getUiDesigner(state).styles;
const getWindowsTable = (state: AppState) => getUiDesigner(state).windows;
const getControlsTable = (state: AppState) => getUiDesigner(state).controls;

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

export const getComponentsIds = (state: AppState, tabId: string) => getOpenedProject(state, tabId).components;
export const getComponent = (state: AppState, componentId: string) => getComponentsTable(state).byId[componentId];
const getPlugin = (state: AppState, pluginId: string) => getPluginsTable(state).byId[pluginId];
export const getResourcesIds = (state: AppState, tabId: string) => getOpenedProject(state, tabId).resources;
export const getResource = (state: AppState, resourceId: string) => getResourcesTable(state).byId[resourceId];
export const getStylesIds = (state: AppState, tabId: string) => getOpenedProject(state, tabId).styles;
export const getStyle = (state: AppState, styleId: string) => getStylesTable(state).byId[styleId];
export const getWindowsIds = (state: AppState, tabId: string) => getOpenedProject(state, tabId).windows;
export const getWindow = (state: AppState, windowId: string) => getWindowsTable(state).byId[windowId];
export const getControl = (state: AppState, controlId: string) => getControlsTable(state).byId[controlId];

export const getComponentsMap = (state: AppState) => getComponentsTable(state).byId;
export const getPluginsMap = (state: AppState) => getPluginsTable(state).byId;
export const getWindowsMap = (state: AppState) => getWindowsTable(state).byId;
export const getResourcesMap = (state: AppState) => getResourcesTable(state).byId;
export const getStylesMap = (state: AppState) => getStylesTable(state).byId;
export const getControlsMap = (state: AppState) => getControlsTable(state).byId;

export const getComponentAndPlugin = (state: AppState, componentId: string) => {
  const component = getComponent(state, componentId);
  if (!component) {
    return;
  }

  const plugin = getPlugin(state, component.plugin);
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
    getComponentsMap,
    getPluginsMap,
    (project, components, plugins) => project.components.map(id => {
      const component = components[id];
      const plugin = plugins[component.plugin];
      return { component, plugin };
    })
  );
}

export function makeGetPluginsMap() {
  return createSelector(
    getOpenedProject,
    getComponentsMap,
    getPluginsMap,
    (project, components, plugins) => {
      const map = new Map<string, UiPlugin>();

      for(const id of project.components) {
        const component = components[id];
        const plugin = plugins[component.plugin];
        map.set(component.componentId, plugin);
      }

      return map;
    }
  );
}

export function makeGetResourceUsage() {
  return createSelector(
    getOpenedProject,
    getWindowsMap,
    getControlsMap,
    (state: AppState, tabId: string, resourceId: string) => resourceId,
    (project, windows, controls, resourceId) => {
      const usage: Usage = [];

      for (const wid of project.windows) {
        const window = windows[wid];

        if (window.backgroundResource === resourceId) {
          usage.push([{ type: 'window', id: wid }]);
        }

        for (const cid of window.controls) {
          const control = controls[cid];
          if (isResourceUsedByControl(control, resourceId)) {
            usage.push([
              { type: 'window', id: wid },
              { type: 'control', id: cid },
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

export function makeGetWindowUsage() {
  return createSelector(
    getOpenedProject,
    getWindowsMap,
    getControlsMap,
    (state: AppState, tabId: string, windowId: string) => windowId,
    (project, windows, controls, windowId) => {
      const usage: Usage = [];

      for (const [key, value] of Object.entries(project.defaultWindow)) {
        if (value === windowId) {
          usage.push([{ type: 'defaultWindow', id: key }]);
        }
      }

      for (const wid of project.windows) {
        const window = windows[wid];
        for (const cid of window.controls) {
          const control = controls[cid];
          for (const aid of ['primaryAction', 'secondaryAction'] as ('primaryAction' | 'secondaryAction')[]) {
            if (control[aid]?.window?.id === windowId) {
              usage.push([
                { type: 'window', id: window.windowId },
                { type: 'control', id: control.controlId },
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

export function makeGetStyleUsage() {
  return createSelector(
    getOpenedProject,
    getWindowsMap,
    getControlsMap,
    (state: AppState, tabId: string, styleId: string) => styleId,
    (project, windows, controls, styleId) => {
      const usage: Usage = [];

      for (const wid of project.windows) {
        const window = windows[wid];

        if (window.style.includes(styleId)) {
          usage.push([{ type: 'window', id: wid }]);
        }

        for (const cid of window.controls) {
          const control = controls[cid];
          if (control.style.includes(styleId)) {
            usage.push([
              { type: 'window', id: wid },
              { type: 'control', id: cid },
            ]);
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