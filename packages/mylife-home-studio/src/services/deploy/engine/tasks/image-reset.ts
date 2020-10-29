import { createLogger, TaskImplementation, TaskMetadata } from '../tasks-utils';

export const metadata: TaskMetadata = {
  description: 'reset image data (root fs, config, image)',
  parameters: [],
};

export const execute: TaskImplementation = async (context, parameters) => {
  const log = createLogger(context, 'image:reset');
  log.info('image reset');
  context.root = null;
  context.config = null;
};
