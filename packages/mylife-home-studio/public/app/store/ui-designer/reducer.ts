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
import { createTable, tableAdd, tableRemove, tableSet } from '../common/reducer-tools';
import { ActionTypes as TabsActionTypes, UpdateTabAction, NewTabAction, TabType } from '../tabs/types';
import { ActionTypes, UiDesignerState, UiOpenedProject, DesignerTabActionData, UiComponent, UiPlugin, UiResource, UiWindow } from './types';

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
      openedProject.defaultWindow = { desktop: null, mobile: null };
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
      tableSet(openedProject.windows, window, true);
      break;
    }

    case 'clear-ui-window': {
      const { id } = update as ClearUiWindowNotification;
      tableRemove(openedProject.windows, id);
      break;
    }

    case 'rename-ui-window': {
      const { id, newId } = update as RenameUiWindowNotification;
      const window = openedProject.windows.byId[id];
      tableRemove(openedProject.windows, id);
      window.id = newId;
      tableSet(openedProject.windows, window, true);

      break;
    }

    default:
      throw new Error(`Unhandled update operation: ${update.operation}`);
  }
}

function updateComponentData(openedProject: UiOpenedProject, componentData: UiComponentData) {
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
