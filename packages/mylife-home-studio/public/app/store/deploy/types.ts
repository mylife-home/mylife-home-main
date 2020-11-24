import { Table } from '../common/types';
import { TaskMetadata, RecipeConfig, StepConfig, StepType, RecipeStepConfig, TaskStepConfig, TaskParameters, RunLogSeverity, RunError } from '../../../../shared/deploy';

export const enum ActionTypes {
  SET_NOTIFICATION = 'deploy/set-notification',
  CLEAR_NOTIFICATION = 'deploy/clear-notification',
  PUSH_UPDATES = 'deploy/push-updates',
  SET_RECIPE = 'deploy/set-recipe',
  CLEAR_RECIPE = 'deploy/clear-recipe',
  PIN_RECIPE = 'deploy/pin-recipe',
  START_RECIPE = 'deploy/start-recipe',
  UPLOAD_FILES = 'deploy/upload-files',
  DOWNLOAD_FILE = 'deploy/download-file',
  DELETE_FILE = 'deploy/delete-file',
  RENAME_FILE = 'deploy/rename-file',
  UPLOAD_FILES_PROGRESS = 'deploy/upload-files-progress',
  DOWNLOAD_FILE_PROGRESS = 'deploy/download-file-progress',
}

export { TaskMetadata, RecipeConfig, StepConfig, StepType, RecipeStepConfig, TaskStepConfig, TaskParameters, RunLogSeverity, RunError };

export interface Task {
  id: string;
  metadata: TaskMetadata;
}

export interface Recipe {
  id: string;
  config: RecipeConfig;
  pinned: boolean;
}

export interface Run {
  id: string;
  recipe: string;
  logs: RunLog[];
  status: 'created' | 'running' | 'ended';
  creation: Date;
  end: Date;
  err: RunError;
}

export interface RunLog {
  date: Date;
  category: string;
  severity: RunLogSeverity;
  message: string;
}

export interface FileInfo {
  id: string;
  size: number;
  modifiedDate: Date;
}

export interface Update {
  operation: 'task-set' | 'recipe-set' | 'recipe-clear' | 'recipe-pin' | 'run-set' | 'run-clear' | 'run-add-log' | 'file-set' | 'file-clear';
}

// no clear, tasks are static
export interface SetTask extends Update {
  operation: 'task-set';
  task: Task;
}

export interface SetRecipe extends Update {
  operation: 'recipe-set';
  recipe: Recipe;
}

export interface ClearRecipe extends Update {
  operation: 'recipe-clear';
  id: string;
}

export interface PinRecipe extends Update {
  operation: 'recipe-pin';
  id: string;
  value: boolean;
}

export interface SetRun extends Update {
  operation: 'run-set';
  run: Run;
}

export interface ClearRun extends Update {
  operation: 'run-clear';
  id: string;
}

export interface AddRunLog extends Update {
  operation: 'run-add-log';
  id: string;
  log: RunLog;
}

export interface SetFile extends Update {
  operation: 'file-set';
  file: FileInfo;
}

export interface ClearFile extends Update {
  operation: 'file-clear';
  id: string;
}

export interface UpdateUploadFilesProgress {
  fileIndex: number;
  doneSize: number;
}

export interface TransferFileProgress {
  name: string;
  totalSize: number;
  doneSize: number;
}

export interface TransferFileProgress {
  name: string;
  totalSize: number;
  doneSize: number;
}

export interface DeployState {
  notifierId: string;
  tasks: Table<Task>;
  recipes: Table<Recipe>;
  runs: Table<Run>;
  files: Table<FileInfo>;

  // we can have it only once because it is used in a modal
  uploadFilesProgress: TransferFileProgress[];
  downloadFileProgress: TransferFileProgress;
}
