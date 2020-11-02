import { createLogger, TaskImplementation, TaskMetadata } from '../engine/tasks-utils';

export const metadata: TaskMetadata = {
  description : 'set a variable to a value',
  parameters  : [
    { name : 'name', description: 'variable name', type: 'string' },
    { name : 'value', description: 'variable value', type: 'string' }
  ]
};

export const execute: TaskImplementation = async (context, parameters) => {
  const log = createLogger(context, 'variables:set');
  const { name, value } = parameters;
  log.info(`${name} = ${value}`);
  context.variables = context.variables || {};
  context.variables[name] = value;
};