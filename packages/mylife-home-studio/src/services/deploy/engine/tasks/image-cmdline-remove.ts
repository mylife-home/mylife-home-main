import { createLogger, singleRowFileUpdate, TaskImplementation, TaskMetadata } from '../tasks-utils';

export const metadata: TaskMetadata = {
  description: 'remove a parameter from cmdline.txt',
  parameters: [{ name: 'content', description: 'parameter data to search and remove', type: 'string' }],
};

export const execute: TaskImplementation = async (context, parameters) => {
  const { content } = parameters;
  const log = createLogger(context, 'image:cmdline-remove');
  log.info(`remove in cmdline.txt : '${content}'`);

  singleRowFileUpdate(context.root, ['cmdline.txt'], (file) =>
    file
      .split(' ')
      .filter((it) => it !== content)
      .join(' ')
  );
};
