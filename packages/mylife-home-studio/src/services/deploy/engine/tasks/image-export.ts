import { createLogger, TaskImplementation, TaskMetadata } from '../tasks-utils';
const fs      = require('fs-extra');
const utils   = require('../tasks-utils');
const archive = require('../archive');

export const metadata: TaskMetadata = {
  description : 'export the root fs of the image into the specified archive',
  parameters  : [
    { name : 'archiveName', description: 'archive name', type: 'string' }
  ]
};

export const execute: TaskImplementation = async (context, parameters) => {
  const { archiveName } = parameters;
  const fullArchiveName = utils.absolutePath(archiveName);
  const log = createLogger(context, 'image:export');
  log.info(`export '${fullArchiveName}'`);

  const content = await archive.pack(context.root);
  await fs.writeFile(fullArchiveName, content);
};