import fs from 'fs-extra';
import { createLogger, absolutePath, TaskImplementation, TaskMetadata } from '../engine/tasks-utils';
import * as vfs from '../engine/vfs';

export const metadata: TaskMetadata = {
  description: 'import the specified file into the root fs of the config at the specified path',
  parameters: [
    { name: 'file', description: 'file to import', type: 'string' },
    { name: 'targetPath', description: 'Target path into root fs of config', type: 'string' }
  ],
};

export const execute: TaskImplementation = async (context, parameters) => {
  const { file, targetPath } = parameters;
  const log = createLogger(context, 'config:import-file');
  const fullName = absolutePath(file);
  log.info(`import '${fullName}' into config at '${targetPath}'`);

  const parts = targetPath.split('/').filter(part => !!part);
  const dir = parts.slice();
  dir.pop();

  const content = await fs.readFile(fullName, 'utf8');
  vfs.mkdirp(context.root, dir);
  vfs.writeText(context.root, parts, content);
};
