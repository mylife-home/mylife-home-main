import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { createTable, tableAdd, tableRemove } from '../common/reducer-tools';
import { ActionTypes as TabsActionTypes, NewTabAction, TabIdAction, TabType } from '../tabs/types';
import { ActionTypes, UiDesignerState, UiOpenedProject, DesignerNewTabData } from './types';

const initialState: UiDesignerState = {
  openedProjects: createTable<UiOpenedProject>(),
};

export default createReducer(initialState, {
  [TabsActionTypes.NEW]: (state, action: PayloadAction<NewTabAction>) => {
    const { id, type, data } = action.payload;
    if (type !== TabType.UI_DESIGNER) {
      return;
    }

    const { projectId } = data as DesignerNewTabData;

    const openedProject: UiOpenedProject = {
      id,
      projectId,
      notifierId: null,
    };

    tableAdd(state.openedProjects, openedProject);
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
    }
  },

  // TODO: designer actions
});
