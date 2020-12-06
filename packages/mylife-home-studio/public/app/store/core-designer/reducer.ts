import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { ActionTypes as TabsActionTypes, NewTabAction, TabIdAction, TabType } from '../tabs/types';
import { ActionTypes, CoreDesignersState, CoreDesignerNewTabData, MoveComponentAction } from './types';
import { createTable } from '../common/reducer-tools';

const initialState: CoreDesignersState = {};

import * as schema from '../../files/schema';

export default createReducer(initialState, {
  [TabsActionTypes.NEW]: (state, action: PayloadAction<NewTabAction>) => {
    const { id, type, data } = action.payload;
    if (type !== TabType.CORE_DESIGNER) {
      return;
    }

    // TODO: open project
    const { projectId } = data as CoreDesignerNewTabData;
    const { plugins, components, bindings } = schema.vpanelCore;

    state[id] = {
      plugins: createTable(plugins),
      components: createTable(components),
      bindings: createTable(bindings),
    };
  },

  [TabsActionTypes.CLOSE]: (state, action: PayloadAction<TabIdAction>) => {
    const { id } = action.payload;
    delete state[id];
  },

  [ActionTypes.MOVE_COMPONENT]: (state, action: PayloadAction<MoveComponentAction>) => {
    const { tabId, componentId, position } = action.payload;
    state[tabId].components.byId[componentId].position = position;
  },
});
