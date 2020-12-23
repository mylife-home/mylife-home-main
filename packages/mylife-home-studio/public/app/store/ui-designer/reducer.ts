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
import { createTable, tableAdd, tableRemove, tableSet } from '../common/reducer-tools';
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
      const typedUpdate = update as SetNameProjectNotification;
      openedProject.projectId = typedUpdate.name;
      break;
    }

    case 'set-ui-component-data': {
      const typedUpdate = update as SetUiComponentDataNotification;
      updateComponentData(openedProject, typedUpdate.componentData);
      break;
    }

    case 'set-ui-default-window': {
      const typedUpdate = update as SetUiDefaultWindowNotification;
      openedProject.defaultWindow = typedUpdate.defaultWindow;
      break;
    }

    case 'set-ui-resource': {
      const typedUpdate = update as SetUiResourceNotification;
      tableSet(openedProject.resources, typedUpdate.resource, true);
      break;
    }

    case 'clear-ui-resource': {
      const typedUpdate = update as ClearUiResourceNotification;
      tableRemove(openedProject.resources, typedUpdate.id);
      break;
    }

    case 'rename-ui-resource': {
      const typedUpdate = update as RenameUiResourceNotification;
      // TODO
      break;
    }

    case 'set-ui-window': {
      const typedUpdate = update as SetUiWindowNotification;
      tableSet(openedProject.windows, typedUpdate.window, true);
      break;
    }

    case 'clear-ui-window': {
      const typedUpdate = update as ClearUiWindowNotification;
      tableRemove(openedProject.windows, typedUpdate.id);
      // TODO: remove controls
      break;
    }

    case 'rename-ui-window': {
      const typedUpdate = update as RenameUiWindowNotification;
      // TODO
      break;
    }

    case 'set-ui-control': {
      const typedUpdate = update as SetUiControlNotification;
      // TODO
      break;
    }

    case 'clear-ui-control': {
      const typedUpdate = update as ClearUiControlNotification;
      // TODO
      break;
    }

    case 'rename-ui-control': {
      const typedUpdate = update as RenameUiControlNotification;
      // TODO
      break;
    }
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
