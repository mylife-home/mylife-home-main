import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { ActionTypes, OnlineHistoryState, HistoryItem, StateHistoryItem } from './types';

const initialState: OnlineHistoryState = {
  notifierId: null,
  items: []
};

const MAX_ITEMS = 2000; // Cannot match backend because we spread component-set with state-set

export default createReducer(initialState, {
  [ActionTypes.SET_NOTIFICATION]: (state, action: PayloadAction<string>) => {
    state.notifierId = action.payload;
  },

  [ActionTypes.CLEAR_NOTIFICATION]: (state) => {
    state.notifierId = null;
    state.items = [];
  },

  [ActionTypes.ADD_HISTORY_ITEMS]: (state, action: PayloadAction<HistoryItem[]>) => {
    for (const item of action.payload) {
      if (state.items.length === MAX_ITEMS) {
        state.items.shift();
      }

      if(item.type === 'state-set') {
        linkPrevState(state.items, item as StateHistoryItem);
      }

      state.items.push(item);
    }
  },
});

function linkPrevState(items: HistoryItem[], newItem: StateHistoryItem) {
  if (newItem.initial) {
    return;
  }

  // items are ordered by timestamp, we are looking for the newest one
  const prevItem = findLast(items, (item) => {
    if (item.type !== 'state-set') {
      return false;
    }

    const typedItem = item as StateHistoryItem;
    return newItem.instanceName === typedItem.instanceName && newItem.componentId === typedItem.componentId && newItem.stateName === typedItem.stateName;
  });

  if (prevItem) {
    newItem.previousItem = prevItem.id;
  }
}

function findLast<T>( array: T[], pred: (item: T, index: number, array: T[]) => boolean) {
  for (let index = array.length - 1; index >=0; --index) {
    const item = array[index];
    if (pred(item, index, array)) {
      return item;
    }
  }
}
