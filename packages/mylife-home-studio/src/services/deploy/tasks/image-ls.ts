import { createLogger, directoryLs, TaskImplementation, TaskMetadata } from '../engine/tasks-utils';

export const metadata: TaskMetadata = {
  description: 'print the content of a directory from the root fs',
  parameters: [{ name: 'path', description: 'path to directory to list', type: 'string' }],
};

export const execute: TaskImplementation = async (context, parameters) => {
  const { path } = parameters;
  const log = createLogger(context, 'image:ls');
  log.debug(`content of directory '${path}' from image`);

  directoryLs(log, context.root, path);
};
