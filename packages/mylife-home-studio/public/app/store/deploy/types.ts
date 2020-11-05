import { Table } from '../common/types';
import { TaskMetadata, RecipeConfig, RunLogSeverity } from '../../../../shared/deploy';

export const enum ActionTypes {
  SET_NOTIFICATION = 'deploy/set-notification',
  CLEAR_NOTIFICATION = 'deploy/clear-notification',
  PUSH_UPDATES = 'deploy/push-updates'
}

export { TaskMetadata, RecipeConfig, RunLogSeverity } ;

export interface Task {
  name: string;
  metadata: TaskMetadata
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

export interface DeployState {
  notifierId: string;
  // TODO
}
