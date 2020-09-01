import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { ActionTypes, NewTabAction, TabIdAction, MoveTabAction, TabsState, TabState } from './types';

const initialState: TabsState = {
  byId: {},
  allIds: [],
  activeId: null
};

export default createReducer(initialState, {
  [ActionTypes.NEW]: (state, action: PayloadAction<NewTabAction>) => {
    const { id, closable } = action.payload;
    const tab: TabState = {
      id,
      closable,
      active: false,
      index: state.allIds.length
    };

    state.byId[id] = tab;
    state.allIds.push(id);

    activate(state, id);
  },

  [ActionTypes.CLOSE]: (state, action: PayloadAction<TabIdAction>) => {
    const tab = state.byId[action.payload.id];

    delete state.byId[tab.id];
    state.allIds.splice(tab.index, 1);

    if (state.activeId === tab.id) {
      // activate new tab
      state.activeId = null;

      if (state.allIds.length === 0) {
        return;
      }

      const newActiveIndex = Math.max(tab.index, state.allIds.length - 1);
      activate(state, state.allIds[newActiveIndex]);
    }
  },

  [ActionTypes.MOVE]: (state, action: PayloadAction<MoveTabAction>) => {
    const { id, position } = action.payload;
    const sourceIndex = state.byId[id].index;
    const targetIndex = position;
    
    state.allIds.splice(sourceIndex, 1);
    state.allIds.splice(targetIndex, 0, id);
  },

  [ActionTypes.ACTIVATE]: (state, action: PayloadAction<TabIdAction>) => {
    activate(state, action.payload.id);
  },
});

function activate(state: TabsState, id: string) {
  if (state.activeId) {
    const oldTab = state.byId[state.activeId];
    oldTab.active = false;
  }

  state.activeId = id;
  state.byId[id].active = true;
}