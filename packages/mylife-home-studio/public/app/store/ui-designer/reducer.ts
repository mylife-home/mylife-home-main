import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { arrayClear, arraySet, createTable, tableAdd, tableRemove } from '../common/reducer-tools';
import { ActionTypes as TabsActionTypes, UpdateTabAction, NewTabAction, TabType } from '../tabs/types';
import {
  ActionTypes,
  UiDesignerState,
  UiOpenedProject,
  DesignerTabActionData,
  UpdateProjectNotification,
  SetNameProjectNotification,
  SetUiDefaultWindowNotification,
  SetUiComponentDataNotification,
  SetUiResourceNotification,
  ClearUiResourceNotification,
  SetUiWindowNotification,
  ClearUiWindowNotification,
  Definition
} from './types';

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

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
      definition: { resources: [], windows: [], defaultWindow: {} },
      componentData: { components: [], plugins: {} },
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
      openedProject.definition = { resources: [], windows: [], defaultWindow: {} };
      openedProject.componentData = { components: [], plugins: {} };
    }
  },

  [ActionTypes.UPDATE_PROJECT]: (state, action: PayloadAction<{ id: string; update: UpdateProjectNotification }[]>) => {
    for (const { id, update } of action.payload) {
      const openedProject = state.openedProjects.byId[id];
      applyProjectUpdate(openedProject, update);
    }
  },
});

function applyProjectUpdate(openedProject: Mutable<UiOpenedProject>, update: UpdateProjectNotification) {
  const definition: Mutable<Definition> = openedProject.definition;
  switch (update.operation) {
    case 'set-name': {
      const typedUpdate = update as SetNameProjectNotification;
      openedProject.projectId = typedUpdate.name;
      break;
    }

    case 'set-ui-component-data': {
      const typedUpdate = update as SetUiComponentDataNotification;
      openedProject.componentData = typedUpdate.componentData;
      break;
    }

    case 'set-ui-default-window': {
      const typedUpdate = update as SetUiDefaultWindowNotification;
      definition.defaultWindow = typedUpdate.defaultWindow;
      break;
    }


    case 'set-ui-resource': {
      const typedUpdate = update as SetUiResourceNotification;
      arraySet(definition.resources, typedUpdate.resource);
      break;
    }

    case 'clear-ui-resource': {
      const typedUpdate = update as ClearUiResourceNotification;
      arrayClear(definition.resources, typedUpdate.id);
      break;
    }

    case 'set-ui-window': {
      const typedUpdate = update as SetUiWindowNotification;
      arraySet(definition.windows, typedUpdate.window);
      break;
    }

    case 'clear-ui-window': {
      const typedUpdate = update as ClearUiWindowNotification;
      arrayClear(definition.windows, typedUpdate.id);
      break;
    }
  }
}