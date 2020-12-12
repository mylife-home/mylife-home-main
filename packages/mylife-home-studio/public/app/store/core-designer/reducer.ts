import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { ActionTypes as TabsActionTypes, NewTabAction, TabIdAction, TabType } from '../tabs/types';
import { ActionTypes, CoreDesignerState, DesignerNewTabData, MoveComponentAction, CoreOpenedProject } from './types';
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
    const { projectId } = data as DesignerNewTabData;
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

  [TabsActionTypes.CLOSE]: (state, action: PayloadAction<TabIdAction>) => {
    const { id } = action.payload;
    // TODO: close project
    tableRemove(state.openedProjects, id);
  },

  [ActionTypes.MOVE_COMPONENT]: (state, action: PayloadAction<MoveComponentAction>) => {
    const { tabId, componentId, position } = action.payload;
    const openedProject = state.openedProjects.byId[tabId];
    openedProject.components.byId[componentId].position = position;
  },
});
