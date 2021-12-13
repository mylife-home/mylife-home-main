export interface Run {
  id: string;
  recipe: string;
  logs: RunLog[];
  status: 'created' | 'running' | 'ended';
  creation: number;
  end: number;
  err: RunError;
}

export interface RunError {
  message: string;
  name: string;
  stack: string;
}

export interface RunLog {
  date: number;
  category: string;
  severity: RunLogSeverity;
  message: string;
}

export type RunLogSeverity = 'debug' | 'info' | 'warning' | 'error';

export interface RecipeConfig {
  description: string;
  steps: StepConfig[];
}

export type StepType = 'task' | 'recipe';

export interface StepConfig {
  type: StepType;
  enabled: boolean;
  note: string;
}

export interface TaskStepConfig extends StepConfig {
  type: 'task';
  task: string;
  parameters: TaskParameters;
}

export interface RecipeStepConfig extends StepConfig {
  type: 'recipe';
  recipe: string;
}

export interface FileInfo {
  id: string;
  size: number;
  modifiedDate: number;
}

export interface TaskMetadata {
  description: string;
  parameters: {
    name: string;
    description: string;
    type: 'string';
    default?: any;
  }[];
}

export type TaskParameters = { [key: string]: string };

export interface UpdateDataNotification {
  operation: 'task-set' | 'recipe-set' | 'recipe-clear' | 'recipe-pin' | 'run-set' | 'run-clear' | 'run-add-log' | 'file-set' | 'file-clear';
}

// no clear, tasks are static
export interface SetTaskNotification extends UpdateDataNotification {
  operation: 'task-set';
  id: string;
  metadata: TaskMetadata;
}

export interface SetRecipeNotification extends UpdateDataNotification {
  operation: 'recipe-set';
  id: string;
  config: RecipeConfig;
}

export interface ClearRecipeNotification extends UpdateDataNotification {
  operation: 'recipe-clear';
  id: string;
}

export interface PinRecipeNotification extends UpdateDataNotification {
  operation: 'recipe-pin';
  id: string;
  value: boolean;
}

export interface SetRunNotification extends UpdateDataNotification {
  operation: 'run-set';
  run: Run;
}

export interface ClearRunNotification extends UpdateDataNotification {
  operation: 'run-clear';
  id: string;
}

export interface AddRunLogNotification extends UpdateDataNotification {
  operation: 'run-add-log';
  id: string;
  log: RunLog;
}

export interface SetFileNotification extends UpdateDataNotification {
  operation: 'file-set';
  file: FileInfo;
}

export interface ClearFileNotification extends UpdateDataNotification {
  operation: 'file-clear';
  id: string;
}
