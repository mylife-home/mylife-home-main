import { createLogger, TaskImplementation, TaskMetadata } from '../tasks-utils';
const utils = require('../tasks-utils');

export const metadata: TaskMetadata = {
  description : 'add a parameter to cmdline.txt',
  parameters  : [
    { name : 'content', description: 'parameter data to add', type: 'string' }
  ]
};

export const execute: TaskImplementation = async (context, parameters) => {
  const { content } = parameters;
  const log = utils.createLogger(context, 'image:cmdline-add');
  const data = ' ' + content;
  log.info(`append cmdline.txt : '${data}'`);

  utils.singleRowFileUpdate(context.root, [ 'cmdline.txt' ], file => file + data);
};
