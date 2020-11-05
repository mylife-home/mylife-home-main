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
  steps: StepConfig[];
}

export interface StepConfig {
  type: string;
}

export interface TaskStepConfig extends StepConfig {
  task: string;
  parameters: TaskParameters;
}

export interface RecipeStepConfig extends StepConfig {
  recipe: string;
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

export type TaskParameters = { [key: string]: string; };

export interface UpdateDataNotification {
  operation: 'task-set' | 'recipe-set' | 'recipe-clear' | 'recipe-pin' | 'run-set' | 'run-clear' | 'run-add-log';
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
