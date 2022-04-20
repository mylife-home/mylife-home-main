import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import {
  ClearUiResourceNotification,
  ClearUiWindowNotification,
  UiComponentData,
  RenameUiResourceNotification,
  RenameUiWindowNotification,
  SetNameProjectNotification,
  SetUiComponentDataNotification,
  SetUiDefaultWindowNotification,
  SetUiResourceNotification,
  SetUiWindowNotification,
  UpdateProjectNotification,
} from '../../../../shared/project-manager';
import { createTable, tableAdd, tableRemove, tableSet, tableRemoveAll, tableClear, arrayAdd, arraySet, arrayRemove } from '../common/reducer-tools';
import { ActionTypes as TabsActionTypes, UpdateTabAction, NewTabAction, TabType } from '../tabs/types';
import { ActionTypes, UiDesignerState, UiOpenedProject, DesignerTabActionData, UiComponent, UiPlugin, UiResource, UiWindow, UiControl, Selection } from './types';

const initialState: UiDesignerState = {
  openedProjects: createTable<UiOpenedProject>(),
  components: createTable<UiComponent>(),
  plugins: createTable<UiPlugin>(),
  resources: createTable<UiResource>(),
  windows: createTable<UiWindow>(),
  controls: createTable<UiControl>(),
};

const DEFAULT_SELECTION: Selection = { type: 'project' };

export default createReducer(initialState, {
  [TabsActionTypes.NEW]: (state, action: PayloadAction<NewTabAction>) => {
    const { id, type, data } = action.payload;
    if (type !== TabType.UI_DESIGNER) {
      return;
    }

    const { projectId } = data as DesignerTabActionData;

    const openedProject: UiOpenedProject = {
      id,
      projectId,
      notifierId: null,
      components: [],
      plugins: [],
      resources: [],
      windows: [],
      selection: DEFAULT_SELECTION,
      defaultWindow: { desktop: null, mobile: null },
    };

    tableAdd(state.openedProjects, openedProject);
  },

  [TabsActionTypes.UPDATE]: (state, action: PayloadAction<UpdateTabAction>) => {
    const { id, data } = action.payload;
    const openedProject = state.openedProjects.byId[id];
    if (openedProject) {
      // else it's another type
      const { projectId } = data as DesignerTabActionData;
      openedProject.projectId = projectId;
    }
  },

  [ActionTypes.REMOVE_OPENED_PROJECT]: (state, action: PayloadAction<{ tabId: string; }>) => {
    const { tabId } = action.payload;

    tableRemove(state.openedProjects, tabId);
  },

  [ActionTypes.SET_NOTIFIER]: (state, action: PayloadAction<{ tabId: string; notifierId: string; }>) => {
    const { tabId, notifierId } = action.payload;
    const openedProject = state.openedProjects.byId[tabId];
    openedProject.notifierId = notifierId;
  },

  [ActionTypes.CLEAR_ALL_NOTIFIERS]: (state, action) => {
    for (const openedProject of Object.values(state.openedProjects.byId)) {
      openedProject.notifierId = null;
      openedProject.components = [];
      openedProject.plugins = [];
      openedProject.resources = [];
      openedProject.windows = [];
      openedProject.selection = DEFAULT_SELECTION;
      openedProject.defaultWindow = { desktop: null, mobile: null };
    }

    tableClear(state.components);
    tableClear(state.plugins);
    tableClear(state.resources);
    tableClear(state.windows);
  },

  [ActionTypes.UPDATE_PROJECT]: (state, action: PayloadAction<{ tabId: string; update: UpdateProjectNotification; }[]>) => {
    for (const { tabId, update } of action.payload) {
      const openedProject = state.openedProjects.byId[tabId];
      applyProjectUpdate(state, openedProject, update);
    }
  },

  [ActionTypes.SELECT]: (state, action: PayloadAction<{ tabId: string; selection: Selection }>) => {
    const { tabId, selection } = action.payload;
    const openedProject = state.openedProjects.byId[tabId];
    openedProject.selection = selection;
  },

  // Apply this change right away to improve designer UX, and debounce server update requests
  // Note that server update will apply anyway
  [ActionTypes.SET_WINDOW]: (state, action: PayloadAction<{ tabId: string; window: UiWindow; }>) => {
    const { tabId, window } = action.payload;
    const openedProject = state.openedProjects.byId[tabId];
    const existing = state.windows.byId[window.id];
    
    // only apply immediatly changes to existing window, ignore new as there is no UX valuable improvement
    if (!existing) {
      return;
    }

    const windowData = prepareWindowData(openedProject, window, { adaptIds: false });
    Object.assign(existing, windowData);
  },

  // Apply this change right away to improve designer UX, and debounce server update requests
  // Note that server update will apply anyway
  [ActionTypes.SET_CONTROL]: (state, action: PayloadAction<{ tabId: string; windowId: string; control: UiControl; }>) => {
    const { tabId, control } = action.payload;
    const openedProject = state.openedProjects.byId[tabId];
    const existing = state.controls.byId[control.id];

    // only apply immediatly changes to existing window, ignore new as there is no UX valuable improvement
    if (!existing) {
      return;
    }

    const controlData = prepareControlData(openedProject, control, { adaptIds: false });
    Object.assign(existing, controlData);
  },
});

function applyProjectUpdate(state: UiDesignerState, openedProject: UiOpenedProject, update: UpdateProjectNotification) {
  switch (update.operation) {
    case 'set-name': {
      const { name } = update as SetNameProjectNotification;
      openedProject.projectId = name;
      break;
    }

    case 'reset': {
      tableRemoveAll(state.components, openedProject.components);
      tableRemoveAll(state.plugins, openedProject.plugins);
      tableRemoveAll(state.resources, openedProject.resources);
      tableRemoveAll(state.windows, openedProject.windows);

      openedProject.components = [];
      openedProject.plugins = [];
      openedProject.resources = [];
      openedProject.windows = [];
      openedProject.selection = DEFAULT_SELECTION;
      openedProject.defaultWindow = { desktop: null, mobile: null };

      break;
    }

    case 'set-ui-component-data': {
      const { componentData } = update as SetUiComponentDataNotification;
      updateComponentData(state, openedProject, componentData);
      break;
    }

    case 'set-ui-default-window': {
      const { defaultWindow } = update as SetUiDefaultWindowNotification;
      openedProject.defaultWindow = {
        desktop: makeNullableId(openedProject, defaultWindow.desktop),
        mobile: makeNullableId(openedProject, defaultWindow.mobile),
      };
      break;
    }

    case 'set-ui-resource': {
      const { resource: resourceData } = update as SetUiResourceNotification;
      const { id: resourceId, ...data } = resourceData;

      const resource: UiResource = {
        id: `${openedProject.id}:${resourceId}`,
        resourceId,
        ...data
      };

      tableSet(state.resources, resource, true);
      arraySet(openedProject.resources, resource.id, true);
      break;
    }

    case 'clear-ui-resource': {
      const { id: resourceId } = update as ClearUiResourceNotification;
      const id = `${openedProject.id}:${resourceId}`;
      tableRemove(state.resources, id);
      arrayRemove(openedProject.resources, id);
      break;
    }

    case 'rename-ui-resource': {
      const { id: resourceId, newId: newResourceId } = update as RenameUiResourceNotification;
      const id = `${openedProject.id}:${resourceId}`;
      const newId = `${openedProject.id}:${newResourceId}`;

      const resource = state.resources.byId[id];
      tableRemove(state.resources, id);
      arrayRemove(openedProject.resources, id);

      resource.id = newId;
      resource.resourceId = newResourceId;

      tableSet(state.resources, resource, true);
      arraySet(openedProject.resources, resource.id, true);
      break;
    }

    case 'set-ui-window': {
      const { window: windowData } = update as SetUiWindowNotification;
      const { id: windowId, controls } = windowData;

      const id = `${openedProject.id}:${windowId}`;

      const existing = state.windows.byId[id];
      if (existing) {
        tableRemoveAll(state.controls, existing.controls);
      }

      const controlIds = controls.map(controlData => {
        const control: UiControl = {
          id: `${openedProject.id}:${windowId}:${controlData.id}`,
          controlId: controlData.id,
          ... prepareControlData(openedProject, controlData, { adaptIds: true })
        };

        tableSet(state.controls, control, true);

        return control.id;
      });

      const window: UiWindow = {
        id: `${openedProject.id}:${windowId}`,
        windowId,
        controls: controlIds,
        ...prepareWindowData(openedProject, windowData, { adaptIds: true }),
      };

      tableSet(state.windows, window, true);
      arraySet(openedProject.windows, window.id, true);
      break;
    }

    case 'clear-ui-window': {
      const { id: windowId } = update as ClearUiWindowNotification;
      const id = `${openedProject.id}:${windowId}`;

      const window = state.windows.byId[id];
      tableRemoveAll(state.controls, window.controls);

      tableRemove(state.windows, id);
      arrayRemove(openedProject.windows, id);

      if (openedProject.selection.type === 'window' && openedProject.selection.id === id) {
        openedProject.selection = DEFAULT_SELECTION;
      }

      break;
    }

    case 'rename-ui-window': {
      const { id: windowId, newId: newResourceId } = update as RenameUiWindowNotification;
      const oldId = `${openedProject.id}:${windowId}`;
      const newId = `${openedProject.id}:${newResourceId}`;

      const window = state.windows.byId[oldId];
      tableRemove(state.windows, oldId);
      arrayRemove(openedProject.windows, oldId);

      window.id = newId;
      window.windowId = newResourceId;

      tableSet(state.windows, window, true);
      arraySet(openedProject.windows, window.id, true);

      if (openedProject.selection.type === 'window' && openedProject.selection.id === oldId) {
        openedProject.selection.id = newId;
      }

      for (const [index, oldId] of window.controls.entries()) {
        const control = state.controls.byId[oldId];

        tableRemove(state.controls, oldId);
        const newId = control.id = `${window.id}:${control.controlId}`;
        tableSet(state.controls, control, true);

        window.controls[index] = newId;
      }

      break;
    }

    default:
      throw new Error(`Unhandled update operation: ${update.operation}`);
  }
}

function updateComponentData(state: UiDesignerState, openedProject: UiOpenedProject, componentData: UiComponentData) {
  tableRemoveAll(state.plugins, openedProject.plugins);
  tableRemoveAll(state.components, openedProject.components);
  openedProject.plugins = [];
  openedProject.components = [];

  for (const [pluginId, data] of Object.entries(componentData.plugins)) {
    const id = `${openedProject.id}:${pluginId}`;
    const plugin: UiPlugin = { id, ...data };

    tableSet(state.plugins, plugin, true);
    arrayAdd(openedProject.plugins, plugin.id);
  }

  for (const { id: componentId, plugin: pluginId, ...data } of componentData.components) {
    const id = `${openedProject.id}:${componentId}`;
    const plugin = `${openedProject.id}:${pluginId}`;

    const component: UiComponent = {
      id,
      componentId,
      plugin,
      ...data
    };

    tableSet(state.components, component, true);
    arrayAdd(openedProject.components, component.id);
  }

  openedProject.plugins.sort();
  openedProject.components.sort();
}

function prepareWindowData(openedProject: UiOpenedProject, window: Omit<UiWindow, 'id' | 'windowId' | 'controls'>, { adaptIds }: { adaptIds: boolean }) {
  const { style, height, width, backgroundResource } = window;

  return {
    style, height, width,
    backgroundResource: prepareNullableId(openedProject, backgroundResource, { adaptIds })
  };
}

function prepareControlData(openedProject: UiOpenedProject, control: Omit<UiControl, 'id' | 'controlId'>, { adaptIds }: { adaptIds: boolean }) {
  const { style, height, width, x, y, display, text, primaryAction, secondaryAction } = control;

  const controlData = { style, height, width, x, y, display, text, primaryAction, secondaryAction };

  for (const aid of ['primaryAction', 'secondaryAction'] as ('primaryAction' | 'secondaryAction')[]) {
    if (!controlData[aid]) {
      continue;
    }

    if (controlData[aid].window) {
      controlData[aid] = { 
        ... controlData[aid],
        window: {
          ... controlData[aid].window,
          id: prepareNullableId(openedProject, controlData[aid].window.id, { adaptIds })
        },
      };
    }
    
    if (controlData[aid].component) {
      controlData[aid] = { 
        ... controlData[aid],
        component: {
          ... controlData[aid].component,
          id: prepareNullableId(openedProject, controlData[aid].component.id, { adaptIds })
        },
      };
    }
  }

  if (controlData.display) {
    controlData.display = {
      ...controlData.display,
      componentId: prepareNullableId(openedProject, controlData.display.componentId, { adaptIds }),
      defaultResource: prepareNullableId(openedProject, controlData.display.defaultResource, { adaptIds }),
      map: controlData.display.map.map(({ resource, ...item }) => ({ ...item, resource: prepareNullableId(openedProject, resource, { adaptIds }) }))
    };
  }

  if (controlData.text) {
    controlData.text = {
      ...controlData.text,
      context: controlData.text.context.map(({ componentId, ...item }) => ({ ...item, componentId: prepareNullableId(openedProject, componentId, { adaptIds }) }))
    };
  }

  return controlData;
}

function prepareNullableId(openedProject: UiOpenedProject, id: string, { adaptIds }: { adaptIds: boolean }) {
  return adaptIds ? makeNullableId(openedProject, id) : id;
}

function makeNullableId(openedProject: UiOpenedProject, id: string) {
  return id ? `${openedProject.id}:${id}` : id;
}
