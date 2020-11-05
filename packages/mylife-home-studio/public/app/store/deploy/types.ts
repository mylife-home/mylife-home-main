import { Table } from '../common/types';
import { TaskMetadata, RecipeConfig, RunLogSeverity } from '../../../../shared/deploy';

export const enum ActionTypes {
  SET_NOTIFICATION = 'deploy/set-notification',
  CLEAR_NOTIFICATION = 'deploy/clear-notification',
  PUSH_UPDATES = 'deploy/push-updates'
}

export { TaskMetadata, RecipeConfig, RunLogSeverity };

export interface Task {
  name: string;
  metadata: TaskMetadata;
}

export interface Recipe {
  name: string;
  config: RecipeConfig;
}

export interface Run {
  id: number;
  recipe: string;
  logs: RunLog[];
  status: 'created' | 'running' | 'ended';
  creation: Date;
  end: Date;
  err: Error;
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
  name: string;
}

export interface PinRecipe extends Update {
  operation: 'recipe-pin';
  name: string;
  value: boolean;
}

export interface SetRun extends Update {
  operation: 'run-set';
  run: Run;
}

export interface ClearRun extends Update {
  operation: 'run-clear';
  id: number;
}

export interface AddRunLog extends Update {
  operation: 'run-add-log';
  id: number;
  log: RunLog;
}

export interface DeployState {
  notifierId: string;
  // TODO
}
