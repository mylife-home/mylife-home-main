import { createLogger, TaskImplementation, TaskMetadata } from '../engine/tasks-utils';

export const metadata: TaskMetadata = {
  description : 'reset variables',
  parameters  : []
};

export const execute: TaskImplementation = async (context, parameters) => {
  const log = createLogger(context, 'variables:reset');
  log.info('variables reset');
  context.variables = null;
};