import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { ActionTypes as TabsActionTypes, NewTabAction, TabIdAction, TabType } from '../tabs/types';
import { CoreDesignerState, Plugin, Component, Binding, ActionTypes, CoreDesignersState, CoreDesignerNewTabData } from './types';
import { createTable } from '../common/reducer-tools';

const initialState: CoreDesignersState = {};

export default createReducer(initialState, {
  [TabsActionTypes.NEW]: (state, action: PayloadAction<NewTabAction>) => {
    const { id, type, data } = action.payload;
    if (type !== TabType.CORE_DESIGNER) {
      return;
    }

    const { plugins, components, bindings } = data as CoreDesignerNewTabData;

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
});
