import fs from 'fs-extra';
import { createLogger, TaskImplementation, TaskMetadata, absolutePath } from '../engine/tasks-utils';
import * as archive from '../engine/archive';

export const metadata: TaskMetadata = {
  description : 'export the root fs of the image into the specified archive',
  parameters  : [
    { name : 'archiveName', description: 'archive name', type: 'string' }
  ]
};

export const execute: TaskImplementation = async (context, parameters) => {
  const { archiveName } = parameters;
  const fullArchiveName = absolutePath(archiveName);
  const log = createLogger(context, 'image:export');
  log.info(`export '${fullArchiveName}'`);

  const content = await archive.pack(context.root);
  await fs.writeFile(fullArchiveName, content);
};