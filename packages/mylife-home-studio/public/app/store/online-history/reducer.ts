import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { createTable } from '../common/reducer-tools';
import { Table } from '../common/types';
import { ActionTypes, OnlineHistoryState, HistoryItem, StateHistoryItem } from './types';

const initialState: OnlineHistoryState = {
  notifierId: null,
  items: createTable<HistoryItem>(),
};

const MAX_ITEMS = 2000; // Cannot match backend because we spread component-set with state-set

export default createReducer(initialState, {
  [ActionTypes.SET_NOTIFICATION]: (state, action: PayloadAction<string>) => {
    state.notifierId = action.payload;
  },

  [ActionTypes.CLEAR_NOTIFICATION]: (state) => {
    state.notifierId = null;
    state.items = createTable<HistoryItem>();
  },

  [ActionTypes.ADD_HISTORY_ITEMS]: (state, action: PayloadAction<HistoryItem[]>) => {
    for (const item of action.payload) {
      addItem(state.items, item);
    }
  },
});

function addItem(items: Table<HistoryItem>, newItem: HistoryItem) {
  if (items.allIds.length === MAX_ITEMS) {
    itemsShift(items);
  }

  if(newItem.type === 'state-set') {
    linkPrevState(items, newItem as StateHistoryItem);
  }
  
  items.byId[newItem.id] = newItem;
  items.allIds.push(newItem.id);
}

function itemsShift(items: Table<HistoryItem>) {
  const removedId = items.allIds.shift();
  const removedItem = items.byId[removedId];
  delete items.byId[removedId]

  // if it is a state change, it can be used as prev value of another item
  if (removedItem.type !== 'state-set') {
    return;
  }

  for (const item of Object.values(items.byId)) {
    if (item.type !== 'state-set') {
      continue;
    }

    const typedItem = item as StateHistoryItem;
    if (typedItem.previousItemId === removedId) {
      delete typedItem.previousItemId;
      break; // there is only one link
    }
  }
}

function linkPrevState(items: Table<HistoryItem>, newItem: StateHistoryItem) {
  if (newItem.initial) {
    return;
  }

  // items are ordered by timestamp, we are looking for the newest one
  const prevItemId = findLast(items.allIds, (id) => {
    const item = items.byId[id];
    if (item.type !== 'state-set') {
      return false;
    }

    const typedItem = item as StateHistoryItem;
    return newItem.instanceName === typedItem.instanceName && newItem.componentId === typedItem.componentId && newItem.stateName === typedItem.stateName;
  });

  if (prevItemId) {
    newItem.previousItemId = prevItemId;
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
