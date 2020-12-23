import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import {
  ClearUiControlNotification,
  ClearUiResourceNotification,
  ClearUiWindowNotification,
  ComponentData,
  RenameUiControlNotification,
  RenameUiResourceNotification,
  RenameUiWindowNotification,
  SetNameProjectNotification,
  SetUiComponentDataNotification,
  SetUiControlNotification,
  SetUiDefaultWindowNotification,
  SetUiResourceNotification,
  SetUiWindowNotification,
  UpdateProjectNotification,
} from '../../../../shared/project-manager';
import { arrayAdd, arrayRemove, createTable, tableAdd, tableRemove, tableSet } from '../common/reducer-tools';
import { ActionTypes as TabsActionTypes, UpdateTabAction, NewTabAction, TabType } from '../tabs/types';
import { ActionTypes, UiDesignerState, UiOpenedProject, DesignerTabActionData, UiComponent, UiPlugin, UiResource, UiWindow, UiControl } from './types';

const initialState: UiDesignerState = {
  openedProjects: createTable<UiOpenedProject>(),
};

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

      components: createTable<UiComponent>(),
      plugins: createTable<UiPlugin>(),
      resources: createTable<UiResource>(),
      windows: createTable<UiWindow>(),
      controls: createTable<UiControl>(),
      defaultWindow: {},
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

  [ActionTypes.REMOVE_OPENED_PROJECT]: (state, action: PayloadAction<{ id: string }>) => {
    const { id } = action.payload;

    tableRemove(state.openedProjects, id);
  },

  [ActionTypes.SET_NOTIFIER]: (state, action: PayloadAction<{ id: string; notifierId: string }>) => {
    const { id, notifierId } = action.payload;
    const openedProject = state.openedProjects.byId[id];
    openedProject.notifierId = notifierId;
  },

  [ActionTypes.CLEAR_ALL_NOTIFIERS]: (state, action) => {
    for (const openedProject of Object.values(state.openedProjects.byId)) {
      openedProject.notifierId = null;

      openedProject.components = createTable<UiComponent>();
      openedProject.plugins = createTable<UiPlugin>();
      openedProject.resources = createTable<UiResource>();
      openedProject.windows = createTable<UiWindow>();
      openedProject.controls = createTable<UiControl>();
      openedProject.defaultWindow = {};
    }
  },

  [ActionTypes.UPDATE_PROJECT]: (state, action: PayloadAction<{ id: string; update: UpdateProjectNotification }[]>) => {
    for (const { id, update } of action.payload) {
      const openedProject = state.openedProjects.byId[id];
      applyProjectUpdate(openedProject, update);
    }
  },
});

function applyProjectUpdate(openedProject: UiOpenedProject, update: UpdateProjectNotification) {
  switch (update.operation) {
    case 'set-name': {
      const { name } = update as SetNameProjectNotification;
      openedProject.projectId = name;
      break;
    }

    case 'set-ui-component-data': {
      const { componentData } = update as SetUiComponentDataNotification;
      updateComponentData(openedProject, componentData);
      break;
    }

    case 'set-ui-default-window': {
      const { defaultWindow } = update as SetUiDefaultWindowNotification;
      openedProject.defaultWindow = defaultWindow;
      break;
    }

    case 'set-ui-resource': {
      const { resource } = update as SetUiResourceNotification;
      tableSet(openedProject.resources, resource, true);
      break;
    }

    case 'clear-ui-resource': {
      const { id } = update as ClearUiResourceNotification;
      tableRemove(openedProject.resources, id);
      break;
    }

    case 'rename-ui-resource': {
      const { id, newId } = update as RenameUiResourceNotification;
      const resource = openedProject.resources.byId[id];
      tableRemove(openedProject.resources, id);
      resource.id = newId;
      tableSet(openedProject.resources, resource, true);
      break;
    }

    case 'set-ui-window': {
      const { window } = update as SetUiWindowNotification;
      // reuse existing controls or init array
      const controls = openedProject.windows.byId[window.id]?.controls || [];
      tableSet(openedProject.windows, { ...window, controls }, true);
      break;
    }

    case 'clear-ui-window': {
      const { id } = update as ClearUiWindowNotification;
      const window = openedProject.windows.byId[id];
      tableRemove(openedProject.windows, id);

      for (const controlId of window.controls) {
        const fullId = `${id}:${controlId}`;
        tableRemove(openedProject.controls, fullId);
      }

      break;
    }

    case 'rename-ui-window': {
      const { id, newId } = update as RenameUiWindowNotification;
      const window = openedProject.windows.byId[id];
      tableRemove(openedProject.windows, id);
      window.id = newId;
      tableSet(openedProject.windows, window, true);

      for (const [index, fullId] of window.controls.entries()) {
        const [, controlId] = fullId.split(':');
        const fullNewId = `${newId}:${controlId}`;
        window.controls[index] = fullNewId;

        const control = openedProject.controls.byId[fullId];
        tableRemove(openedProject.controls, fullId);
        control.id = fullNewId;
        tableSet(openedProject.controls, control, true);
      }

      break;
    }

    case 'set-ui-control': {
      const { windowId, control } = update as SetUiControlNotification;
      const fullId = `${windowId}:${control.id}`;
      const window = openedProject.windows.byId[windowId];

      tableSet(openedProject.controls, { ...control, id: fullId }, true);
      arrayAdd(window.controls, fullId, true);
      break;
    }

    case 'clear-ui-control': {
      const { windowId, id } = update as ClearUiControlNotification;
      const fullId = `${windowId}:${id}`;
      const window = openedProject.windows.byId[windowId];

      tableRemove(openedProject.controls, fullId);
      arrayRemove(window.controls, fullId);
      break;
    }

    case 'rename-ui-control': {
      const { windowId, id, newId } = update as RenameUiControlNotification;
      const fullId = `${windowId}:${id}`;
      const fullNewId = `${windowId}:${newId}`;
      const control = openedProject.controls.byId[fullId];
      const window = openedProject.windows.byId[windowId];

      tableRemove(openedProject.controls, fullId);
      arrayRemove(window.controls, fullId);
      control.id = fullNewId;
      tableSet(openedProject.controls, control, true);
      arrayAdd(window.controls, fullNewId, true);
      break;
    }

    default:
      throw new Error(`Unhandle update operation: ${update.operation}`);
  }
}

function updateComponentData(openedProject: UiOpenedProject, componentData: ComponentData) {
  const components = createTable<UiComponent>();
  const plugins = createTable<UiPlugin>();

  for (const [id, plugin] of Object.entries(componentData.plugins)) {
    const uiPlugin: UiPlugin = { id, ...plugin };
    tableSet(plugins, uiPlugin, true);
  }

  for (const component of componentData.components) {
    tableSet(components, component, true);
  }

  openedProject.plugins = plugins;
  openedProject.components = components;
}
