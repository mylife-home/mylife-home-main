import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { ActionTypes as TabsActionTypes, NewTabAction, TabType, UpdateTabAction } from '../tabs/types';
import { ActionTypes, CoreDesignerState, DesignerTabActionData, MoveComponentAction, CoreOpenedProject, UpdateProjectNotification, SetNameProjectNotification } from './types';
import { createTable, tableAdd, tableRemove } from '../common/reducer-tools';

const initialState: CoreDesignerState = {
  openedProjects: createTable<CoreOpenedProject>()
};

import * as schema from '../../files/schema';

export default createReducer(initialState, {
  [TabsActionTypes.NEW]: (state, action: PayloadAction<NewTabAction>) => {
    const { id, type, data } = action.payload;
    if (type !== TabType.CORE_DESIGNER) {
      return;
    }

    // TODO: open project
    const { projectId } = data as DesignerTabActionData;
    const { plugins, components, bindings } = schema.vpanelCore;
    
    const openedProject: CoreOpenedProject = {
      id,
      projectId,
      notifierId: null,
      plugins: createTable(plugins),
      components: createTable(components),
      bindings: createTable(bindings)
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

  [ActionTypes.REMOVE_OPENED_PROJECT]: (state, action: PayloadAction<{ id: string; }>) => {
    const { id } = action.payload;

    tableRemove(state.openedProjects, id);
  },
  
  [ActionTypes.SET_NOTIFIER]: (state, action: PayloadAction<{ id: string; notifierId: string; }>) => {
    const { id, notifierId } = action.payload;
    const openedProject = state.openedProjects.byId[id];
    openedProject.notifierId = notifierId;
  },
  
  [ActionTypes.CLEAR_ALL_NOTIFIERS]: (state, action) => {
    for(const openedProject of Object.values(state.openedProjects.byId)) {
      openedProject.notifierId = null;

      // TODO: reset project state
    }
  },

  [ActionTypes.UPDATE_PROJECT]: (state, action: PayloadAction<{ id: string; update: UpdateProjectNotification }[]>) => {
    for (const { id, update } of action.payload) {
      const openedProject = state.openedProjects.byId[id];
      applyProjectUpdate(openedProject, update);
    }
  },

  [ActionTypes.MOVE_COMPONENT]: (state, action: PayloadAction<MoveComponentAction>) => {
    const { tabId, componentId, position } = action.payload;
    const openedProject = state.openedProjects.byId[tabId];
    openedProject.components.byId[componentId].position = position;
  },
});

function applyProjectUpdate(openedProject: CoreOpenedProject, update: UpdateProjectNotification) {
  switch (update.operation) {
    case 'set-name': {
      const typedUpdate = update as SetNameProjectNotification;
      openedProject.projectId = typedUpdate.name;
      break;
    }

    // TODO
  }
}