import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { createTable, tableRemove, tableSet } from '../common/reducer-tools';
import { ActionTypes, AddRunLog, ClearRecipe, ClearRun, DeployState, PinRecipe, Recipe, Run, SetRecipe, SetRun, SetTask, Task, Update } from './types';

const initialState: DeployState = {
  notifierId: null,
  tasks: createTable<Task>(),
  recipes: createTable<Recipe>(),
  runs: createTable<Run>(),
};

export default createReducer(initialState, {
  [ActionTypes.SET_NOTIFICATION]: (state, action: PayloadAction<string>) => {
    state.notifierId = action.payload;
  },

  [ActionTypes.CLEAR_NOTIFICATION]: (state) => {
    state.notifierId = null;
    state.tasks = createTable<Task>();
    state.recipes = createTable<Recipe>();
    state.runs = createTable<Run>();
  },

  [ActionTypes.PUSH_UPDATES]: (state, action: PayloadAction<Update[]>) => {
    for (const update of action.payload) {
      switch (update.operation) {
        case 'task-set': {
          const { task } = update as SetTask;
          tableSet(state.tasks, task, true);

          break;
        }

        case 'recipe-set': {
          const { recipe } = update as SetRecipe;
          // set-recipe have no pinned info
          recipe.pinned = state.recipes.byId[recipe.id]?.pinned || false;
          tableSet(state.recipes, recipe, true);

          break;
        }

        case 'recipe-clear': {
          const { id } = update as ClearRecipe;
          tableRemove(state.recipes, id);

          break;
        }

        case 'recipe-pin': {
          const { id, value } = update as PinRecipe;
          const recipe = state.recipes.byId[id];
          recipe.pinned = value;
        }

        case 'run-set': {
          const { run } = update as SetRun;
          // we must merge existing logs
          const existing = state.runs.byId[run.id];
          run.logs = existing?.logs || [];
          tableSet(state.runs, run);
        }

        case 'run-clear': {
          const { id } = update as ClearRun;
          tableRemove(state.runs, id);

          break;
        }

        case 'run-add-log': {
          const { id, log } = update as AddRunLog;
          const run = state.runs.byId[id];
          run.logs.push(log);
        }
      }
    }
  },
});
