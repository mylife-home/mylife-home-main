import fs from 'fs-extra';
import { createLogger, TaskImplementation, TaskMetadata, absolutePath } from '../engine/tasks-utils';
import * as vfs from '../engine/vfs';
import * as archive from '../engine/archive';

export const metadata: TaskMetadata = {
  description : 'import the specified archive into the root fs of the image',
  parameters  : [
    { name : 'archiveName', description: 'archive name', type: 'string' },
    { name : 'rootPath', description: 'path of the root fs inside the archive', type: 'string', default: '' }
  ]
};

export const execute: TaskImplementation = async (context, parameters) => {
  const { archiveName, rootPath } = parameters;
  const fullArchiveName = absolutePath(archiveName);
  const log = createLogger(context, 'image:import');
  log.info(`import '${fullArchiveName}' using root path '${rootPath}' into image`);

  const buffer = await fs.readFile(fullArchiveName);

  context.root = context.root || new vfs.Directory({ missing: true });
  await archive.extract(buffer, context.root, { baseDirectory: rootPath });
};