import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { createTable, tableAdd, tableRemove } from '../common/reducer-tools';
import { ActionTypes as TabsActionTypes, UpdateTabAction, NewTabAction, TabType } from '../tabs/types';
import { ActionTypes, UiDesignerState, UiOpenedProject, DesignerTabActionData } from './types';

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
      definition: null,
      componentData: null,
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

      // TODO: reset project state
    }
  },

  // TODO: designer actions
});

/*

// server -> client


export interface UpdateProjectNotification {
  operation: 'set-name'
  | 'set-ui-default-window' | 'set-ui-component-data' | 'set-ui-resource' | 'clear-ui-resource' | 'set-ui-window' | 'clear-ui-window';
}

export interface SetNameProjectNotification extends UpdateProjectNotification {
  operation: 'set-name';
  name: string;
}

export interface SetUiDefaultWindowNotification extends UpdateProjectNotification {
  operation: 'set-ui-default-window';
  defaultWindow: DefaultWindow;
}

export interface SetUiComponentDataNotification extends UpdateProjectNotification {
  operation: 'set-ui-component-data';
  componentData: ComponentData;
}

export interface SetUiResourceNotification extends UpdateProjectNotification {
  operation: 'set-ui-resource';
  resource: DefinitionResource;
}

export interface ClearUiResourceNotification extends UpdateProjectNotification {
  operation: 'clear-ui-resource';
  id: string;
}

export interface SetUiWindowNotification extends UpdateProjectNotification {
  operation: 'set-ui-window';
  window: Window;
}

export interface ClearUiWindowNotification extends UpdateProjectNotification {
  operation: 'clear-ui-window';
  id: string;
}
*/