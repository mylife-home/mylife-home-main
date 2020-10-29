import { createLogger, TaskImplementation, TaskMetadata } from '../tasks-utils';
import * as vfs from '../vfs';
import * as archive from '../archive';

export const metadata: TaskMetadata = {
  description: 'pack the config into the root fs',
  parameters: [],
};

export const execute: TaskImplementation = async (context, parameters) => {
  const log = createLogger(context, 'config:pack');
  const configFile = context.root.list().find((node) => node.name.endsWith('.apkovl.tar.gz')) as vfs.File;
  log.info(`pack config into image file '${configFile.name}'`);
  configFile.content = await archive.pack(context.config);
};
