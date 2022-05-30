import { createSelector } from '@reduxjs/toolkit';
import { ById } from '../common/types';
import { AppState } from '../types';
import { UiControl, UiPlugin, UiTemplateInstance, UiView, UiViewType, Usage, MemberType } from './types';

const getUiDesigner = (state: AppState) => state.uiDesigner;
const getOpenedProjects = (state: AppState) => getUiDesigner(state).openedProjects;
const getComponentsTable = (state: AppState) => getUiDesigner(state).components;
const getPluginsTable = (state: AppState) => getUiDesigner(state).plugins;
const getResourcesTable = (state: AppState) => getUiDesigner(state).resources;
const getStylesTable = (state: AppState) => getUiDesigner(state).styles;
const getWindowsTable = (state: AppState) => getUiDesigner(state).windows;
const getTemplatesTable = (state: AppState) => getUiDesigner(state).templates;
const getControlsTable = (state: AppState) => getUiDesigner(state).controls;
const getTemplateInstancesTable = (state: AppState) => getUiDesigner(state).templateInstances;

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
export const getTemplatesIds = (state: AppState, tabId: string) => getOpenedProject(state, tabId).templates;
export const getTemplate = (state: AppState, templateId: string) => getTemplatesTable(state).byId[templateId];
export const getControl = (state: AppState, controlId: string) => getControlsTable(state).byId[controlId];
export const getTemplateInstance = (state: AppState, templateInstanceId: string) => getTemplateInstancesTable(state).byId[templateInstanceId];

export const getComponentsMap = (state: AppState) => getComponentsTable(state).byId;
export const getPluginsMap = (state: AppState) => getPluginsTable(state).byId;
export const getWindowsMap = (state: AppState) => getWindowsTable(state).byId;
export const getTemplatesMap = (state: AppState) => getTemplatesTable(state).byId;
export const getResourcesMap = (state: AppState) => getResourcesTable(state).byId;
export const getStylesMap = (state: AppState) => getStylesTable(state).byId;
export const getControlsMap = (state: AppState) => getControlsTable(state).byId;
export const getTemplateInstancesMap = (state: AppState) => getTemplateInstancesTable(state).byId;

export const getView = (state: AppState, viewType: UiViewType, viewId: string): UiView => {
  switch (viewType) {
    case 'window':
      return getWindow(state, viewId);
    case 'template':
      return getTemplate(state, viewId);
    default:
      throw new Error(`Unsupported view type: '${viewType}'`);
  }
}

export const getComponentAndPlugin = (state: AppState, componentId: string) => {
  const component = getComponent(state, componentId);
  if (!component) {
    return;
  }

  const plugin = getPlugin(state, component.plugin);
  return { component, plugin };
};

export const getComponentMemberValueType = (state: AppState, templateId: string, componentId: string, memberName: string) => {
  if (!memberName) {
    return;
  }

  if (componentId) {
    const componentAndPlugin = getComponentAndPlugin(state, componentId);
    const { plugin } = componentAndPlugin;
    return plugin.members[memberName]?.valueType;
  } else {
    const template = getTemplate(state, templateId);
    return template.exports[memberName]?.valueType;
  }
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
    getTemplatesMap,
    getControlsMap,
    (state: AppState, tabId: string, resourceId: string) => resourceId,
    (project, windows, templates, controls, resourceId) => {
      const usage: Usage = [];

      for (const wid of project.windows) {
        const window = windows[wid];

        if (window.backgroundResource === resourceId) {
          usage.push([{ type: 'window', id: wid }]);
        }

        fillViewResourceUsage('window', window.windowId, window, controls, resourceId, usage);
      }

      for (const tid of project.templates) {
        const template = templates[tid];
        fillViewResourceUsage('template', template.templateId, template, controls, resourceId, usage);
      }

      return usage;
    }
  );
};

function fillViewResourceUsage(viewType: UiViewType, viewId: string, view: UiView, controls: ById<UiControl>, resourceId: string, usage: Usage) {
  for (const cid of view.controls) {
    const control = controls[cid];
    if (isResourceUsedByControl(control, resourceId)) {
      usage.push([
        { type: viewType, id: viewId },
        { type: 'control', id: cid },
      ]);
    }
  }
}

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
    getTemplatesMap,
    getControlsMap,
    (state: AppState, tabId: string, windowId: string) => windowId,
    (project, windows, templates, controls, windowId) => {
      const usage: Usage = [];

      for (const [key, value] of Object.entries(project.defaultWindow)) {
        if (value === windowId) {
          usage.push([{ type: 'defaultWindow', id: key }]);
        }
      }

      for (const wid of project.windows) {
        const window = windows[wid];
        fillViewWindowUsage('window', window.windowId, window, controls, windowId, usage);
      }

      for (const tid of project.templates) {
        const template = templates[tid];
        fillViewWindowUsage('template', template.templateId, template, controls, windowId, usage);
      }

      return usage;
    }
  );
};

function fillViewWindowUsage(viewType: UiViewType, viewId: string, view: UiView, controls: ById<UiControl>, windowId: string, usage: Usage) {
  for (const cid of view.controls) {
    const control = controls[cid];
    for (const aid of ['primaryAction', 'secondaryAction'] as ('primaryAction' | 'secondaryAction')[]) {
      if (control[aid]?.window?.id === windowId) {
        usage.push([
          { type: viewType, id: viewId },
          { type: 'control', id: control.controlId },
          { type: 'action', id: aid },
        ]);
      }
    }
  }
}

export function makeGetTemplateUsage() {
  return createSelector(
    getOpenedProject,
    getWindowsMap,
    getTemplatesMap,
    getTemplateInstancesMap,
    (state: AppState, tabId: string, templateId: string) => templateId,
    (project, windows, templates, templateInstances, templateId) => {
      const usage: Usage = [];

      for (const wid of project.windows) {
        const window = windows[wid];
        fillViewTemplateInstanceUsage('window', window.windowId, window, templateInstances, templateId, usage);
      }

      for (const tid of project.templates) {
        const template = templates[tid];
        fillViewTemplateInstanceUsage('template', template.templateId, template, templateInstances, templateId, usage);
      }
      return usage;
    }
  );
};

function fillViewTemplateInstanceUsage(viewType: UiViewType, viewId: string, view: UiView, templateInstances: ById<UiTemplateInstance>, templateId: string, usage: Usage) {
  for (const tid of view.templates) {
    const templateInstance = templateInstances[tid];
    if (templateInstance.templateId === templateId) {
      usage.push([
        { type: viewType, id: viewId },
        { type: 'template-instance', id: templateInstance.templateInstanceId },
      ]);
    }
  }
}

export function makeGetStyleUsage() {
  return createSelector(
    getOpenedProject,
    getWindowsMap,
    getTemplatesMap,
    getControlsMap,
    (state: AppState, tabId: string, styleId: string) => styleId,
    (project, windows, templates, controls, styleId) => {
      const usage: Usage = [];

      for (const wid of project.windows) {
        const window = windows[wid];

        if (window.style.includes(styleId)) {
          usage.push([{ type: 'window', id: wid }]);
        }

        fillViewStyleUsage('window', window.windowId, window, controls, styleId, usage);
      }

      for (const tid of project.templates) {
        const template = templates[tid];
        fillViewStyleUsage('template', template.templateId, template, controls, styleId, usage);
      }

      return usage;
    }
  );
};

function fillViewStyleUsage(viewType: UiViewType, viewId: string, view: UiView, controls: ById<UiControl>, styleId: string, usage: Usage) {
  for (const cid of view.controls) {
    const control = controls[cid];
    if (control.style.includes(styleId)) {
      usage.push([
        { type: viewType, id: viewId },
        { type: 'control', id: cid },
      ]);
    }
  }
}

export const getDefaultWindow = (state: AppState, tabId: string) => {
  const project = getOpenedProject(state, tabId);
  return project.defaultWindow;
};

export const getSelection = (state: AppState, tabId: string) => {
  const project = getOpenedProject(state, tabId);
  return project.selection;
}

export interface MemberItem {
  memberType: MemberType;
  valueType: string;
}

export function makeGetTemplateCandidateExports() {
  return createSelector(
    (state: AppState, tabId: string) => getOpenedProject(state, tabId).plugins,
    getPluginsMap,
    (projectPlugins, plugins) => {
      const set = new Set<string>();
      const list: MemberItem[] = [];
    
      for (const pluginId of projectPlugins) {
        const plugin = plugins[pluginId];
          for (const { memberType, valueType } of Object.values(plugin.members)) {
          const hash = `${memberType}:${valueType}`;
          if (!set.has(hash)) {
            list.push({ memberType, valueType });
          }
        }
      }
    
      return list;
        }
  );
};
