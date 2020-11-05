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