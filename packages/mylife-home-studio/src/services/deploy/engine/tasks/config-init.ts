import { createLogger, TaskImplementation, TaskMetadata } from '../tasks-utils';
import * as vfs from '../vfs';
import * as archive from '../archive';

export const metadata: TaskMetadata = {
  description: 'Extract the config (.apkovl.tar.gz) from the image to context.config',
  parameters: [],
};

export const execute: TaskImplementation = async (context, parameters) => {
  const configFile = context.root.list().find((node) => node.name.endsWith('.apkovl.tar.gz')) as vfs.File;
  context.config = new vfs.Directory({ unnamed: true });
  const log = createLogger(context, 'config:init');
  log.info(`extract config from image file '${configFile.name}'`);
  await archive.extract(configFile.content, context.config);
};
