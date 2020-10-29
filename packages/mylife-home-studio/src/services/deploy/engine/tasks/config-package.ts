import { createLogger, TaskImplementation, TaskMetadata } from '../tasks-utils';
const utils = require('../tasks-utils');

export const metadata: TaskMetadata = {
  description : 'add a package to be installed',
  parameters  : [
    { name : 'name', description: 'package name', type: 'string' }
  ]
};

export const execute: TaskImplementation = async (context, parameters) => {
  const { name } = parameters;
  const log = createLogger(context, 'config:package');
  log.info(`add package '${name}'`);
  utils.configAddPackage(log, context, name);
};
