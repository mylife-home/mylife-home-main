export interface Run {
  id: number;
  recipe: string;
  logs: RunLog[];
  status: 'created' | 'running' | 'ended';
  creation: number;
  end: number;
  err: Error;
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
  name: string;
  parameters: TaskParameters;
}

export interface RecipeStepConfig extends StepConfig {
  name: string;
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
  operation: 'task-set' | 'recipe-set' | 'recipe-clear' | 'run-set' | 'run-clear' | 'run-add-log';
}

// no clear, tasks are static
export interface SetTaskNotification extends UpdateDataNotification {
  operation: 'task-set';
  name: string;
  metadata: TaskMetadata;
}

export interface SetRecipeNotification extends UpdateDataNotification {
  operation: 'recipe-set';
  name: string;
  config: RecipeConfig;
}

export interface ClearRecipeNotification extends UpdateDataNotification {
  operation: 'recipe-clear';
  name: string;
}

export interface SetRunNotification extends UpdateDataNotification {
  operation: 'run-set';
  run: Run;
}

export interface ClearRunNotification extends UpdateDataNotification {
  operation: 'run-clear';
  id: number;
}

export interface AddRunLogNotification extends UpdateDataNotification {
  operation: 'run-add-log';
  id: number;
  log: RunLog;
}
