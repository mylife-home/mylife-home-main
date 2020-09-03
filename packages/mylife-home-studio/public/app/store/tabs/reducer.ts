import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { ActionTypes, NewTabAction, TabIdAction, MoveTabAction, ChangeTabTitleAction, TabsState, TabState } from './types';
import { createTable } from '../common/reducer-tools';

const initialState: TabsState = {
  ...createTable<TabState>(),
  activeId: null
};

export default createReducer(initialState, {
  [ActionTypes.NEW]: (state, action: PayloadAction<NewTabAction>) => {
    const { id, type, title, closable } = action.payload;
    const tab: TabState = {
      id,
      type,
      title,
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

    reindex(state);

    if (state.activeId === tab.id) {
      // activate new tab
      state.activeId = null;

      if (state.allIds.length === 0) {
        return;
      }

      const newActiveIndex = Math.min(tab.index, state.allIds.length - 1);
      activate(state, state.allIds[newActiveIndex]);
    }
  },

  [ActionTypes.MOVE]: (state, action: PayloadAction<MoveTabAction>) => {
    const { id, position } = action.payload;
    const sourceIndex = state.byId[id].index;
    const targetIndex = position;
    
    state.allIds.splice(sourceIndex, 1);
    state.allIds.splice(targetIndex, 0, id);

    reindex(state);
  },

  [ActionTypes.ACTIVATE]: (state, action: PayloadAction<TabIdAction>) => {
    activate(state, action.payload.id);
  },

  [ActionTypes.CHANGE_TITLE]: (state, action: PayloadAction<ChangeTabTitleAction>) => {
    const { id, title } = action.payload;
    const tab = state.byId[id];
    tab.title = title;
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

function reindex(state: TabsState) {
  for(const [index, id] of state.allIds.entries()) {
    state.byId[id].index = index;
  }
}