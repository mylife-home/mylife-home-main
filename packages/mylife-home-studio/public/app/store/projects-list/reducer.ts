import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { createTable, tableSet, tableRemove } from '../common/reducer-tools';
import { Table } from '../common/types';
import { ActionTypes, ProjectsListState, CoreProjectItem, UiProjectItem, Update, BaseProjectItem, SetProject, ClearProject, RenameProject } from './types';

const initialState: ProjectsListState = {
  notifierId: null,
  coreProjects: createTable<CoreProjectItem>(),
  uiProjects: createTable<UiProjectItem>(),
};

export default createReducer(initialState, {
  [ActionTypes.SET_NOTIFICATION]: (state, action: PayloadAction<string>) => {
    state.notifierId = action.payload;
  },

  [ActionTypes.CLEAR_NOTIFICATION]: (state) => {
    state.notifierId = null;
    state.coreProjects = createTable<CoreProjectItem>();
    state.uiProjects = createTable<UiProjectItem>();
  },

  [ActionTypes.PUSH_UPDATES]: (state, action: PayloadAction<Update[]>) => {
    for (const update of action.payload) {
      switch (update.type) {
        case 'core':
          applyUpdate(state.coreProjects, update);
          break;

        case 'ui':
          applyUpdate(state.uiProjects, update);
          break;
      }
    }
  },
});

function applyUpdate<TProjectItem extends BaseProjectItem>(table: Table<TProjectItem>, update: Update) {
  switch(update.operation) {
    case 'set': {
      const typedUpdate = update as SetProject;
      const item = typedUpdate.item as TProjectItem;
      tableSet(table, item, true);
      break;
    }

    case 'clear': {
      const typedUpdate = update as ClearProject;
      tableRemove(table, typedUpdate.id);
      break;
    }

    case 'rename': {
      const { oldId, newId } = update as RenameProject;
      // for now apply it as a clear/set
      const item = table.byId[oldId];
      item.id = newId;
      tableRemove(table, oldId);
      tableSet(table, item, true);
      break;
    }
  }
}