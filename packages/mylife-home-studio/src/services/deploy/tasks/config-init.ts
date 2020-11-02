import { createLogger, TaskImplementation, TaskMetadata } from '../engine/tasks-utils';
import * as vfs from '../engine/vfs';
import * as archive from '../engine/archive';

export const metadata: TaskMetadata = {
  description: 'Extract the config (.apkovl.tar.gz) from the image to context.config',
  parameters: [],
};

export const execute: TaskImplementation = async (context, parameters) => {
  const configFile = context.root.list().find((node) => node.name.endsWith('.apkovl.tar.gz')) as vfs.File;
  context.config = new vfs.Directory({ missing: true });
  const log = createLogger(context, 'config:init');
  log.info(`extract config from image file '${configFile.name}'`);
  await archive.extract(configFile.content, context.config);
};
