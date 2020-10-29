import { createLogger, TaskImplementation, TaskMetadata } from '../tasks-utils';
const utils = require('../tasks-utils');

export const metadata: TaskMetadata = {
  description : 'add a dtparam line in image usercfg.txt ( https://www.raspberrypi.org/documentation/configuration/device-tree.md )',
  parameters  : [
    { name : 'content', description: 'param data to add', type: 'string' }
  ]
};

export const execute: TaskImplementation = async (context, parameters) => {
  const { content } = parameters;
  const log = utils.createLogger(context, 'image:dtparam');
  const row = `dtparam=${content}`;
  log.info(`append usercfg.txt : '${row}'`);
  utils.fileAppendLine(context.root, [ 'usercfg.txt' ], row);
};
