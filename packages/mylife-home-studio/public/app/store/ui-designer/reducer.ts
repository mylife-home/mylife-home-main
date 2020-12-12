import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { createTable, tableAdd, tableRemove } from '../common/reducer-tools';
import { ActionTypes as TabsActionTypes, NewTabAction, TabIdAction, TabType } from '../tabs/types';
import { UiDesignerState, UiOpenedProject, DesignerNewTabData } from './types';

const initialState: UiDesignerState = {
  openedProjects: createTable<UiOpenedProject>(),
};

export default createReducer(initialState, {
  [TabsActionTypes.NEW]: (state, action: PayloadAction<NewTabAction>) => {
    const { id, type, data } = action.payload;
    if (type !== TabType.UI_DESIGNER) {
      return;
    }

    // TODO: epic to open project server side (notifierId)
    const { projectId } = data as DesignerNewTabData;

    const openedProject: UiOpenedProject = {
      id,
      projectId,
      notifierId: null,
    };

    tableAdd(state.openedProjects, openedProject);
  },

  [TabsActionTypes.CLOSE]: (state, action: PayloadAction<TabIdAction>) => {
    const { id } = action.payload;
    // TODO: epic to close project server side (notifierId)
    tableRemove(state.openedProjects, id);
  },

  // TODO: designer actions
});
