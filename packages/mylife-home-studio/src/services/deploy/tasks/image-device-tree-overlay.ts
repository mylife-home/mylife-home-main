import { createLogger, fileAppendLine, TaskImplementation, TaskMetadata } from '../engine/tasks-utils';

export const metadata: TaskMetadata = {
  description: 'add a dtoverlay line in image usercfg.txt ( https://www.raspberrypi.org/documentation/configuration/device-tree.md )',
  parameters: [{ name: 'content', description: 'overlay data to add', type: 'string' }],
};

export const execute: TaskImplementation = async (context, parameters) => {
  const { content } = parameters;
  const log = createLogger(context, 'image:dtoverlay');
  const row = `dtoverlay=${content}`;
  log.info(`append usercfg.txt : '${row}'`);
  fileAppendLine(context.root, ['usercfg.txt'], row);
};
