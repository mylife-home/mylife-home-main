import { Table } from '../common/types';
import { TaskMetadata, RecipeConfig, RunLogSeverity, RunError } from '../../../../shared/deploy';

export const enum ActionTypes {
  SET_NOTIFICATION = 'deploy/set-notification',
  CLEAR_NOTIFICATION = 'deploy/clear-notification',
  PUSH_UPDATES = 'deploy/push-updates'
}

export { TaskMetadata, RecipeConfig, RunLogSeverity, RunError };

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


export interface Update {
  operation: 'task-set' | 'recipe-set' | 'recipe-clear' | 'recipe-pin' | 'run-set' | 'run-clear' | 'run-add-log';
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

export interface DeployState {
  notifierId: string;
  tasks: Table<Task>;
  recipes: Table<Recipe>;
  runs: Table<Run>;
}
