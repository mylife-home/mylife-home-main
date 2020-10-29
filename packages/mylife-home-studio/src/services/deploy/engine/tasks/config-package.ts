import { createLogger, configAddPackage, TaskImplementation, TaskMetadata } from '../tasks-utils';

export const metadata: TaskMetadata = {
  description: 'add a package to be installed',
  parameters: [{ name: 'name', description: 'package name', type: 'string' }],
};

export const execute: TaskImplementation = async (context, parameters) => {
  const { name } = parameters;
  const log = createLogger(context, 'config:package');
  log.info(`add package '${name}'`);
  configAddPackage(log, context, name);
};
