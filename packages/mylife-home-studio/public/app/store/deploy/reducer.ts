import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { createTable, tableRemove, tableSet } from '../common/reducer-tools';
import { ActionTypes, AddRunLog, ClearFile, ClearRecipe, ClearRun, DeployState, FileInfo, PinRecipe, Recipe, Run, SetFile, SetRecipe, SetRun, SetTask, Task, Update, UpdateUploadFilesProgress } from './types';

const initialState: DeployState = {
  notifierId: null,
  tasks: createTable<Task>(),
  recipes: createTable<Recipe>(),
  runs: createTable<Run>(),
  files: createTable<FileInfo>(),
  uploadFilesProgress: null,
  downloadFileProgress: null,
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
    state.files = createTable<FileInfo>();
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

          break;
        }

        case 'run-set': {
          const { run } = update as SetRun;
          // we must merge existing logs
          const existing = state.runs.byId[run.id];
          run.logs = existing?.logs || [];
          tableSet(state.runs, run);

          break;
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

          break;
        }

        case 'file-set': {
          const { file } = update as SetFile;
          tableSet(state.files, file, true);

          break;
        }

        case 'file-clear': {
          const { id } = update as ClearFile;
          tableRemove(state.files, id);

          break;
        }
      }
    }
  },

  [ActionTypes.UPLOAD_FILES]: (state, action: PayloadAction<File[]>) => {
    // init progress
    state.uploadFilesProgress = action.payload.map(file => ({
      name: file.name,
      totalSize: file.size,
      doneSize: 0
    }));
  },

  [ActionTypes.UPLOAD_FILES_PROGRESS]: (state, action: PayloadAction<UpdateUploadFilesProgress>) => {
    const lastIndex = state.uploadFilesProgress.length - 1;
    const update = action.payload;
    if (update.fileIndex === lastIndex && update.doneSize === state.uploadFilesProgress[lastIndex].totalSize) {
      // we reached the end
      state.uploadFilesProgress = null;
      return;
    }

    const fileProgress = state.uploadFilesProgress[update.fileIndex];
    fileProgress.doneSize = update.doneSize;
  },
  
  [ActionTypes.DOWNLOAD_FILE]: (state, action: PayloadAction<string>) => {
    // init progress
    const id = action.payload;
    const file = state.files.byId[id];
    state.downloadFileProgress = {
      name: file.id,
      totalSize: file.size,
      doneSize: 0
    };
  },

  [ActionTypes.DOWNLOAD_FILE_PROGRESS]: (state, action: PayloadAction<number>) => {
    const doneSize = action.payload;
    if (state.downloadFileProgress.totalSize === doneSize) {
      // we reached the end
      state.downloadFileProgress = null;
      return;
    }

    state.downloadFileProgress.doneSize = doneSize;
  },
});
