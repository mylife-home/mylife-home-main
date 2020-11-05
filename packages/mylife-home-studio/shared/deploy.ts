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

export interface RunLog {
  date: number;
  category: string;
  severity: RunLogSeverity;
  message: string;
}

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

export interface UpdateRecipeNotification {
  operation: 'set' | 'clear';
}

export interface SetRecipeNotification extends UpdateRecipeNotification {
  operation: 'set';
  name: string;
  config?: RecipeConfig;
}

export interface ClearRecipeNotification extends UpdateRecipeNotification {
  operation: 'clear';
  name: string;
}

export interface UpdateRunNotification {
  operation: 'set' | 'clear' | 'add-log';
}

export interface SetRunNotification extends UpdateRunNotification {
  operation: 'set';
  run: Run;
}

export interface ClearRunNotification extends UpdateRunNotification {
  operation: 'clear';
  id: number;
}

export interface AddRunLogNotification extends UpdateRunNotification {
  operation: 'add-log';
  id: number;
  log: RunLog;
}
