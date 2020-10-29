import { createLogger, TaskImplementation, TaskMetadata } from '../tasks-utils';
const fs      = require('fs-extra');
const archive = require('../archive');
const utils   = require('../tasks-utils');

export const metadata: TaskMetadata = {
  description : 'Import the specified archive into the root fs of the config',
  parameters  : [
    { name : 'archiveName', description: 'archive name', type: 'string' }
  ]
};

export const execute: TaskImplementation = async (context, parameters) => {
  const { archiveName } = parameters;
  const fullArchiveName = utils.absolutePath(archiveName);
  const log = createLogger(context, 'config:import');
  log.info(`import '${fullArchiveName}' into config`);

  const buffer = await fs.readFile(fullArchiveName);
  await archive.extract(buffer, context.config);
};